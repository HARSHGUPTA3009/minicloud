import { db } from "../db/client";
import { deployments, metrics } from "../db/schema";
import { eq } from "drizzle-orm";
import { checkContainerHealth, getContainerStats } from "./docker.service";

export async function runHealthChecks(): Promise<void> {
  const active = await db
    .select()
    .from(deployments)
    .where(eq(deployments.isActive, true));

  for (const dep of active) {
    if (!dep.containerId) continue;

    const [health, stats] = await Promise.all([
      checkContainerHealth(dep.containerId),
      getContainerStats(dep.containerId),
    ]);

    await db
      .update(deployments)
      .set({ healthStatus: health })
      .where(eq(deployments.id, dep.id));

    await db.insert(metrics).values({
      projectId: dep.projectId,
      deploymentId: dep.id,
      cpu: Math.round(stats.cpu),
      memory: Math.round(stats.memory),
      memoryLimit: Math.round(stats.memoryLimit),
      networkIn: 0,
      networkOut: 0,
    });
  }
}

export function startHealthCheckScheduler(ms = 30000) {
  return setInterval(async () => {
    try {
      await runHealthChecks();
    } catch (e) {
      console.error("Health check error:", e);
    }
  }, ms);
}