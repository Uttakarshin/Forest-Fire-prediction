import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, incidentsTable } from "@workspace/db";
import {
  ListIncidentsQueryParams,
  CreateIncidentBody,
  GetIncidentParams,
  UpdateIncidentParams,
  UpdateIncidentBody,
  DeleteIncidentParams,
  ResolveIncidentParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/incidents", async (req, res): Promise<void> => {
  const query = ListIncidentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(incidentsTable).$dynamic();

  if (query.data.status) {
    dbQuery = dbQuery.where(eq(incidentsTable.status, query.data.status));
  }
  if (query.data.severity) {
    dbQuery = dbQuery.where(eq(incidentsTable.severity, query.data.severity));
  }

  const limit = query.data.limit ?? 100;
  const incidents = await dbQuery.orderBy(desc(incidentsTable.createdAt)).limit(limit);
  res.json(incidents);
});

router.post("/incidents", async (req, res): Promise<void> => {
  const parsed = CreateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const riskScore = computeRiskScore(data.severity, data.windSpeed, data.humidity, data.temperature);

  const [incident] = await db.insert(incidentsTable).values({
    ...data,
    riskScore,
    areaAffectedHa: data.areaAffectedHa ?? 0,
    evacuationOrdered: data.evacuationOrdered ?? false,
  }).returning();

  await logActivity({
    type: "incident_created",
    message: `New ${data.severity} severity incident reported: ${data.title}`,
    severity: severityToActivitySeverity(data.severity),
    relatedId: incident.id,
  });

  res.status(201).json(incident);
});

router.get("/incidents/:id", async (req, res): Promise<void> => {
  const params = GetIncidentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [incident] = await db.select().from(incidentsTable).where(eq(incidentsTable.id, params.data.id));
  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  res.json(incident);
});

router.patch("/incidents/:id", async (req, res): Promise<void> => {
  const params = UpdateIncidentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [incident] = await db.update(incidentsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(incidentsTable.id, params.data.id))
    .returning();

  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  await logActivity({
    type: "incident_updated",
    message: `Incident "${incident.title}" updated`,
    severity: "info",
    relatedId: incident.id,
  });

  res.json(incident);
});

router.delete("/incidents/:id", async (req, res): Promise<void> => {
  const params = DeleteIncidentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [incident] = await db.delete(incidentsTable).where(eq(incidentsTable.id, params.data.id)).returning();
  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/incidents/:id/resolve", async (req, res): Promise<void> => {
  const params = ResolveIncidentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [incident] = await db.update(incidentsTable)
    .set({ status: "resolved", updatedAt: new Date() })
    .where(eq(incidentsTable.id, params.data.id))
    .returning();

  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  await logActivity({
    type: "incident_updated",
    message: `Incident "${incident.title}" marked as resolved`,
    severity: "info",
    relatedId: incident.id,
  });

  res.json(incident);
});

function computeRiskScore(
  severity: string,
  windSpeed?: number | null,
  humidity?: number | null,
  temperature?: number | null
): number {
  let base = 0;
  switch (severity) {
    case "low": base = 20; break;
    case "moderate": base = 45; break;
    case "high": base = 70; break;
    case "critical": base = 90; break;
    default: base = 30;
  }
  let adjustment = 0;
  if (windSpeed != null) adjustment += Math.min(windSpeed / 2, 5);
  if (humidity != null) adjustment -= Math.min((humidity - 30) / 10, 5);
  if (temperature != null) adjustment += Math.min((temperature - 25) / 5, 5);
  return Math.max(0, Math.min(100, base + adjustment));
}

function severityToActivitySeverity(severity: string): string {
  switch (severity) {
    case "critical": return "critical";
    case "high": return "danger";
    case "moderate": return "warning";
    default: return "info";
  }
}

export default router;
