import { Queue } from "bullmq";
import { config } from "../config";
import type { BuildJob } from "@minicloud/shared";

export const buildQueue = new Queue<BuildJob>("build-queue", {
  connection: {
    host: new URL(config.redisUrl).hostname,
    port: Number(new URL(config.redisUrl).port || 6379),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function enqueueBuild(job: BuildJob): Promise<string> {
  const q = await buildQueue.add("build", job, {
   jobId: `deploy-${job.deploymentId}-${Date.now()}`,
    priority: job.triggeredBy === "manual" ? 1 : 5,
  });
  return q.id!;
}

export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    buildQueue.getWaitingCount(),
    buildQueue.getActiveCount(),
    buildQueue.getCompletedCount(),
    buildQueue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
}