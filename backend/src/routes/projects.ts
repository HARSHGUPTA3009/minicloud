import { Router } from "express";
import { db } from "../db/client";
import { projects, deployments } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { enqueueBuild } from "../services/redis.service";
import type { BuildJob, ResourceLimits } from "@minicloud/shared";

const router = Router();

/* -------------------------------------------------------------------------- */
/* Zod Schema                                                                 */
/* -------------------------------------------------------------------------- */

const createSchema = z.object({
  name: z.string().min(1).max(50),
  githubRepo: z.string().url(),
  githubBranch: z.string().default("main"),
  autoRedeploy: z.boolean().default(true),
  envVars: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      isSecret: z.boolean().default(false),
    })
  ).default([]),
  resourceLimits: z.object({
    cpuShares: z.number().min(64).max(1024),
    memoryMb: z.number().min(128).max(4096),
    storageGb: z.number().min(1).max(50),
  }).default({
    cpuShares: 512,
    memoryMb: 512,
    storageGb: 5,
  }),
});

/* -------------------------------------------------------------------------- */
/* GET PROJECTS                                                               */
/* -------------------------------------------------------------------------- */

router.get("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, req.user.id),
      orderBy: desc(deployments.id),
    });

    res.json({ projects: userProjects });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user.id)
      ),
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectDeployments = await db.query.deployments.findMany({
      where: eq(deployments.projectId, project.id),
      orderBy: desc(deployments.id),
    });

    res.json({
      ...project,
      deployments: projectDeployments,
    });

  } catch (e: any) {
    console.error("GET PROJECT ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});
router.post("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const data = createSchema.parse(req.body);

    const slug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const [project] = await db.insert(projects).values({
      name: data.name,
      slug,
      githubRepo: data.githubRepo,
      githubBranch: data.githubBranch,
      webhookSecret: nanoid(32),
      subdomain: `${slug}-${nanoid(6).toLowerCase()}`,
      envVars: data.envVars,
      resourceLimits: data.resourceLimits,
      autoRedeploy: data.autoRedeploy,
      userId: req.user.id,
      status: "active",
    }).returning();

    res.status(201).json({ project });
  } catch (e: any) {
    res.status(e instanceof z.ZodError ? 400 : 500).json({
      error: e instanceof z.ZodError ? e.errors : e.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/* MANUAL DEPLOY                                                              */
/* -------------------------------------------------------------------------- */

router.post("/:id/deploy", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user.id)
      ),
    });

    if (!project) return res.status(404).json({ error: "Not found" });

    const commitSha = (req.body?.commitSha ?? "HEAD").toString();
    const shortSha = commitSha.slice(0, 8);

    const [deployment] = await db.insert(deployments).values({
      projectId: project.id,
      commitSha,
      commitMessage: req.body?.commitMessage ?? "Manual deploy",
      commitAuthor: req.user.email,
      branch: project.githubBranch,
      imageTag: `minicloud/${project.subdomain}:${shortSha}`,
      triggeredBy: "manual",
      logs: [],
    }).returning();

    /* ---------- SAFE ResourceLimits Narrowing ---------- */

    const limits: ResourceLimits =
      typeof project.resourceLimits === "object" &&
      project.resourceLimits !== null &&
      "cpuShares" in project.resourceLimits &&
      "memoryMb" in project.resourceLimits &&
      "storageGb" in project.resourceLimits
        ? project.resourceLimits as ResourceLimits
        : {
            cpuShares: 512,
            memoryMb: 512,
            storageGb: 5,
          };

    const job: BuildJob = {
      id: deployment.id,
      projectId: project.id,
      deploymentId: deployment.id,
      githubRepo: project.githubRepo,
      branch: project.githubBranch,
      commitSha,
      commitMessage: deployment.commitMessage,
      commitAuthor: deployment.commitAuthor,
      envVars: Array.isArray(project.envVars) ? project.envVars : [],
      resourceLimits: limits,
      subdomain: project.subdomain,
      triggeredBy: "manual",
    };

    await enqueueBuild(job);

    await db.update(projects)
      .set({ status: "building" })
      .where(eq(projects.id, project.id));

    res.status(202).json({ deployment });

  } catch (e: any) {
    console.error("DEPLOY ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
