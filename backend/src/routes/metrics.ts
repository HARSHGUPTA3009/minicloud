import { Router } from "express";
import { db } from "../db/client";
import { metrics } from "../db/schema";
import { eq, and, gte, desc } from "drizzle-orm";

const router = Router();
const ranges: Record<string, number> = { "1h": 3600000, "6h": 21600000, "24h": 86400000, "7d": 604800000 };

router.get("/:projectId", async (req, res) => {
  try {
    const since = new Date(Date.now() - (ranges[req.query.range as string] || ranges["1h"]));
    const results = await db.select().from(metrics).where(and(eq(metrics.projectId, req.params.projectId), gte(metrics.timestamp, since))).orderBy(desc(metrics.timestamp)).limit(200);
    res.json({ metrics: results.reverse() });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
