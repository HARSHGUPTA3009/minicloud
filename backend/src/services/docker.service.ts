import Dockerode from "dockerode";
import * as fs from "fs";
import * as tar from "tar";
import { config } from "../config";
import type { EnvVar, ResourceLimits, LogEntry } from "@minicloud/shared";

const docker = new Dockerode({ socketPath: config.dockerSocket });

/* ------------------------------ BUILD IMAGE ------------------------------ */

export async function buildImage(
  repoPath: string,
  imageTag: string,
  onLog: (l: LogEntry) => void
): Promise<void> {
  const tarPath = `/tmp/${imageTag.replace(/[:/]/g, "_")}.tar`;

  await tar.create({ file: tarPath, cwd: repoPath }, ["."]);

  const stream = await docker.buildImage(tarPath, {
    t: imageTag,
    rm: true,
  });

  await new Promise<void>((resolve, reject) => {
    docker.modem.followProgress(
      stream,
      (err: Error | null) => (err ? reject(err) : resolve()),
      (event: any) => {
        if (event.stream)
          onLog({
            timestamp: new Date().toISOString(),
            level: "info",
            message: event.stream.trim(),
            source: "build",
          });

        if (event.error)
          onLog({
            timestamp: new Date().toISOString(),            level: "error",
            message: event.error,
            source: "build",
          });
      }
    );
  });

  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
}

/* ------------------------------ RUN CONTAINER ------------------------------ */
export async function runContainer(
  imageTag: string,
  subdomain: string,
  envVars: EnvVar[],
  limits: ResourceLimits,
  _port: number // no longer used
): Promise<{ containerId: string; containerName: string }> {

  const containerName = `mc_${subdomain}_${Date.now()}`;

  const container = await docker.createContainer({
    Image: imageTag,
    name: containerName,

    Env: envVars.map((e) => `${e.key}=${e.value}`),

    ExposedPorts: { "3000/tcp": {} },

    HostConfig: {
      Memory: limits.memoryMb * 1024 * 1024,
      CpuShares: limits.cpuShares,
      RestartPolicy: { Name: "unless-stopped" },

      // ❌ REMOVE THIS COMPLETELY
      // PortBindings: {
      //   "3000/tcp": [{ HostPort: String(port) }],
      // },
    },

    NetworkingConfig: {
      EndpointsConfig: {
        minicloud_default: {}, // ✅ THIS is the key fix
      },
    },

    Labels: {
      "minicloud.managed": "true",
      "minicloud.subdomain": subdomain,
    },
  });

  await container.start();

  return {
    containerId: container.id,
    containerName,
  };
}
/* ------------------------------ STOP CONTAINER ------------------------------ */

export async function stopContainer(containerId: string): Promise<void> {
  try {
    const container = docker.getContainer(containerId);
    await container.stop({ t: 10 });
    await container.remove();
  } catch (e: any) {
    if (!e.message?.includes("No such container")) throw e;
  }
}

/* ------------------------------ STATS ------------------------------ */

export async function getContainerStats(containerId: string) {
  try {
    const stats = (await docker
      .getContainer(containerId)
      .stats({ stream: false })) as any;

    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;

    const sysDelta =
      stats.cpu_stats.system_cpu_usage -
      stats.precpu_stats.system_cpu_usage;

    const cpu =
      sysDelta > 0
        ? (cpuDelta / sysDelta) *
          (stats.cpu_stats.online_cpus || 1) *
          100
        : 0;

    const memory = stats.memory_stats.usage / 1048576;
    const memoryLimit = stats.memory_stats.limit / 1048576;

    return { cpu, memory, memoryLimit };
  } catch {
    return { cpu: 0, memory: 0, memoryLimit: 512 };
  }
}

/* ------------------------------ LOGS ------------------------------ */

export async function getContainerLogs(
  containerId: string,
  tail = 100
): Promise<string[]> {
  try {
    const logs = await docker.getContainer(containerId).logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    return logs.toString().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/* ------------------------------ HEALTH ------------------------------ */

export async function checkContainerHealth(
  containerId: string
): Promise<"healthy" | "unhealthy" | "unknown"> {
  try {
    const info = await docker.getContainer(containerId).inspect();
    return info.State?.Running ? "healthy" : "unhealthy";
  } catch {
    return "unknown";
  }
}
