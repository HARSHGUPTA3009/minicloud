import { Router } from "express";
import crypto from "crypto";
import { db } from "../db/client";
import { projects, deployments } from "../db/schema";
import { eq } from "drizzle-orm";
import { enqueueBuild } from "../services/redis.service";
import type { BuildJob } from "@minicloud/shared";

const router = Router();

router.post("/:projectId", async (req, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.projectId),
    });

    if (!project) return res.status(404).json({ error: "Not found" });

    const branch = req.body.ref?.replace("refs/heads/", "");
    if (branch !== project.githubBranch) return res.json({ message: "Branch skipped" });

    const commitSha = req.body.after;
    const shortSha = commitSha.substring(0, 8);

    const [deployment] = await db.insert(deployments).values({
      projectId: project.id,
      commitSha,
      commitMessage: req.body.head_commit?.message ?? "Push",
      commitAuthor: req.body.pusher?.name ?? "Unknown",
      branch,
      imageTag: `minicloud/${project.subdomain}:${shortSha}`,
      triggeredBy: "webhook",
      logs: [],
    }).returning();

    await enqueueBuild({
      id: deployment.id,
      projectId: project.id,
      deploymentId: deployment.id,
      githubRepo: project.githubRepo,
      branch,
      commitSha,
      commitMessage: deployment.commitMessage,
      commitAuthor: deployment.commitAuthor,
      envVars: project.envVars ?? [],
      resourceLimits: project.resourceLimits,
      subdomain: project.subdomain,
      triggeredBy: "webhook",
    } as BuildJob);

    res.json({ message: "Build queued" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;