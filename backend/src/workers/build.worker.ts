import { Worker, Job } from "bullmq";
import { db } from "../db/client";
import { deployments, projects } from "../db/schema";
import { eq, and,ne } from "drizzle-orm";
import { cloneRepo, cleanupBuild } from "../services/git.service";
import {
  buildImage,
  runContainer,
  stopContainer,
} from "../services/docker.service";
import { config } from "../config";
import type { BuildJob, LogEntry, BuildStep } from "@minicloud/shared";
import getPort from "get-port";

/* ------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------ */

async function appendLog(id: string, entry: LogEntry) {
  const dep = await db.query.deployments.findFirst({
    where: eq(deployments.id, id),
  });
  if (!dep) return;

  const existingLogs = Array.isArray(dep.logs) ? dep.logs : [];

  await db
    .update(deployments)
    .set({ logs: [...existingLogs, entry] })
    .where(eq(deployments.id, id));
}

async function setStep(id: string, step: BuildStep) {
  await db
    .update(deployments)
    .set({ buildStep: step })
    .where(eq(deployments.id, id));
}

/* ------------------------------------------------ */
/* Main Build Process */
/* ------------------------------------------------ */

async function processBuild(job: Job<BuildJob>) {
  const {
    deploymentId,
    projectId,
    githubRepo,
    branch,
    commitSha,
    commitMessage,
    commitAuthor,
    envVars,
    resourceLimits,
    subdomain,
  } = job.data;

  const shortSha = commitSha?.toString().slice(0, 8) ?? "unknown";

  const log = (
    level: LogEntry["level"],
    message: string,
    source: LogEntry["source"] = "build"
  ) =>
    appendLog(deploymentId, {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
    });

  const started = Date.now();

  try {
    /* ---------------- INITIAL STATE ---------------- */

    await db
      .update(deployments)
      .set({ status: "building", buildStep: "clone" })
      .where(eq(deployments.id, deploymentId));

    log("info", `🚀 Build started for ${githubRepo} @ ${shortSha}`);
    log("info", `"${commitMessage}" by ${commitAuthor}`);

    /* ---------------- CLONE ---------------- */

    await setStep(deploymentId, "clone");

    const buildPath = await cloneRepo(
      githubRepo,
      branch,
      commitSha,
      String(deploymentId),
      (e) => appendLog(deploymentId, e)
    );

    /* ---------------- BUILD IMAGE ---------------- */

    await setStep(deploymentId, "build");

    const imageTag = `minicloud/${subdomain}:${shortSha}`;

    log("info", `🔨 Building Docker image ${imageTag}...`);

    await buildImage(buildPath, imageTag, (e) =>
      appendLog(deploymentId, e)
    );

    log("info", `✅ Image built`);

    /* ---------------- DEPLOY ---------------- */

    await setStep(deploymentId, "deploy");

    await db
      .update(deployments)
      .set({ status: "deploying", imageTag })
      .where(eq(deployments.id, deploymentId));

    log("info", `🚢 Allocating port...`, "deploy");

    // ✅ SAFE PORT ALLOCATION
    const port = await getPort();

    log("info", `Using port ${port}`, "deploy");

	const { containerId, containerName } = await runContainer(
      imageTag,
      subdomain,
      envVars ?? [],
      resourceLimits ?? {
        cpuShares: 512,
        memoryMb: 512,
        storageGb: 5,
      },
      port
    );

    log(
      "info",
      `Container ${containerId.slice(0, 12)} started`,
      "deploy"
    );

    /* ---------------- ROLLING UPDATE ---------------- */

    const prevActive = await db.query.deployments.findFirst({
      where: and(
        eq(deployments.projectId, projectId),
        eq(deployments.isActive, true)
      ),
    });

await db
  .update(deployments)
  .set({ isActive: false })
  .where(
    and(
      eq(deployments.projectId, projectId),
      ne(deployments.id, deploymentId)
    )
  );
    /* ---------------- FINAL STATE ---------------- */

/* ---------------- FINAL STATE ---------------- */

    await db
      .update(deployments)
      .set({
        status: "running",
        buildStep: "done",
        containerId,
	containerName,
        isActive: true,
        healthStatus: "healthy",
        finishedAt: new Date(),
        duration: Math.round((Date.now() - started) / 1000),
        deploymentPort: port,
localUrl: `http://${containerName}:3000`,
        deploymentUrl: `http://${subdomain}.${config.baseDomain}`,
      })
      .where(eq(deployments.id, deploymentId));

    await db
      .update(projects)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    log(
      "info",
      `✅ Live at http://localhost:${port}`,
      "deploy"
    );

    if (
      prevActive?.containerId &&
      prevActive.containerId !== containerId
    ) {
      log(
        "info",
        `🔄 Rolling update: stopping previous container`,
        "deploy"
      );
      await stopContainer(prevActive.containerId);
    }

    cleanupBuild(deploymentId);
  } catch (error: any) {
    console.error("WORKER ERROR:", error);

    await db
      .update(deployments)
      .set({
        status: "failed",
        buildStep: "failed",
        finishedAt: new Date(),
      })
      .where(eq(deployments.id, deploymentId));

    await db
      .update(projects)
      .set({ status: "failed" })
      .where(eq(projects.id, projectId));

    await appendLog(deploymentId, {
      timestamp: new Date().toISOString(),
      level: "error",
      message: `❌ Build failed: ${error.message}`,
      source: "system",
    });

    cleanupBuild(deploymentId);
    throw error;
  }
}

/* ------------------------------------------------ */
/* Worker Setup */
/* ------------------------------------------------ */

const worker = new Worker<BuildJob>("build-queue", processBuild, {
  connection: {
    host: new URL(config.redisUrl).hostname,
    port: Number(new URL(config.redisUrl).port || 6379),
  },
  concurrency: config.maxConcurrentBuilds,
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} done`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

console.log(
  `🔧 Worker running (concurrency: ${config.maxConcurrentBuilds})`
);

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

