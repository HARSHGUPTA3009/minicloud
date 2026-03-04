import { Router } from "express";
import { db } from "../db/client";
import { deployments } from "../db/schema";
import { eq } from "drizzle-orm";
import { getContainerLogs } from "../services/docker.service";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const dep = await db.query.deployments.findFirst({ where: eq(deployments.id, req.params.id) });
    if (!dep) return res.status(404).json({ error: "Not found" });
    res.json({ logs: dep.logs });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/:id/runtime", async (req, res) => {
  try {
    const dep = await db.query.deployments.findFirst({ where: eq(deployments.id, req.params.id) });
    if (!dep?.containerId) return res.status(404).json({ error: "No container" });
    res.json({ logs: await getContainerLogs(dep.containerId, parseInt(req.query.tail as string) || 100) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
