import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, zonesTable } from "@workspace/db";
import {
  CreateZoneBody,
  UpdateZoneParams,
  UpdateZoneBody,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/zones", async (_req, res): Promise<void> => {
  const zones = await db.select().from(zonesTable).orderBy(desc(zonesTable.createdAt));
  res.json(zones);
});

router.post("/zones", async (req, res): Promise<void> => {
  const parsed = CreateZoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [zone] = await db.insert(zonesTable).values({
    ...data,
    riskScore: data.riskScore ?? defaultRiskScore(data.riskLevel),
    lastAssessed: new Date(),
  }).returning();

  await logActivity({
    type: "zone_updated",
    message: `New risk zone added: ${data.name}`,
    severity: "info",
    relatedId: zone.id,
  });

  res.status(201).json(zone);
});

router.patch("/zones/:id", async (req, res): Promise<void> => {
  const params = UpdateZoneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateZoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [zone] = await db.update(zonesTable)
    .set({ ...parsed.data, lastAssessed: new Date() })
    .where(eq(zonesTable.id, params.data.id))
    .returning();

  if (!zone) {
    res.status(404).json({ error: "Zone not found" });
    return;
  }

  res.json(zone);
});

function defaultRiskScore(riskLevel: string): number {
  switch (riskLevel) {
    case "low": return 20;
    case "moderate": return 45;
    case "high": return 72;
    case "extreme": return 92;
    default: return 50;
  }
}

export default router;
