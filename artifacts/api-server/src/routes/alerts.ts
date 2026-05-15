import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, alertsTable } from "@workspace/db";
import {
  ListAlertsQueryParams,
  CreateAlertBody,
  UpdateAlertParams,
  UpdateAlertBody,
  DeleteAlertParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const query = ListAlertsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(alertsTable).$dynamic();
  if (query.data.active !== undefined) {
    dbQuery = dbQuery.where(eq(alertsTable.isActive, query.data.active));
  }

  const alerts = await dbQuery.orderBy(desc(alertsTable.createdAt));
  res.json(alerts);
});

router.post("/alerts", async (req, res): Promise<void> => {
  const parsed = CreateAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [alert] = await db.insert(alertsTable).values({
    ...data,
    isActive: true,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
  }).returning();

  await logActivity({
    type: "alert_issued",
    message: `Alert issued: ${data.title}`,
    severity: data.severity === "critical" ? "critical" : data.severity === "danger" ? "danger" : "warning",
    relatedId: alert.id,
  });

  res.status(201).json(alert);
});

router.patch("/alerts/:id", async (req, res): Promise<void> => {
  const params = UpdateAlertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [alert] = await db.update(alertsTable)
    .set(parsed.data)
    .where(eq(alertsTable.id, params.data.id))
    .returning();

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(alert);
});

router.delete("/alerts/:id", async (req, res): Promise<void> => {
  const params = DeleteAlertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [alert] = await db.delete(alertsTable).where(eq(alertsTable.id, params.data.id)).returning();
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
