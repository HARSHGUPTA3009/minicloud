import { Router } from "express";
import { db } from "../db/client";
import { deployments, projects } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { enqueueBuild } from "../services/redis.service";
import { stopContainer } from "../services/docker.service";
import type { BuildJob } from "@minicloud/shared";

const router = Router();

/* ---------------- GET DEPLOYMENTS ---------------- */

router.get("/", async (req, res) => {
  try {
    const { projectId, limit = "20" } = req.query;

    const results = await db
      .select()
      .from(deployments)
      .where(projectId ? eq(deployments.projectId, projectId as string) : undefined)
      .orderBy(desc(deployments.startedAt))
      .limit(parseInt(limit as string));

    res.json({ deployments: results });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- STOP DEPLOYMENT ---------------- */

router.post("/:id/stop", async (req, res) => {
  try {
    const dep = await db.query.deployments.findFirst({
      where: eq(deployments.id, req.params.id),
    });

    if (!dep) return res.status(404).json({ error: "Not found" });

    if (dep.containerId) await stopContainer(dep.containerId);

    await db.update(deployments)
      .set({ status: "stopped", isActive: false })
      .where(eq(deployments.id, req.params.id));

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;