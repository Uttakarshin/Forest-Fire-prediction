import { Router, type IRouter } from "express";
import { eq, count, avg, sum, desc, and, gte, sql } from "drizzle-orm";
import { db, incidentsTable, alertsTable, zonesTable, resourcesTable, reportsTable, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [incidentStats] = await db.select({
    activeIncidents: count(sql`CASE WHEN ${incidentsTable.status} = 'active' THEN 1 END`),
    containedToday: count(sql`CASE WHEN ${incidentsTable.status} = 'contained' THEN 1 END`),
    totalAreaAffectedHa: sum(incidentsTable.areaAffectedHa),
    averageRiskScore: avg(incidentsTable.riskScore),
  }).from(incidentsTable);

  const [alertStats] = await db.select({
    criticalAlerts: count(sql`CASE WHEN ${alertsTable.severity} = 'critical' AND ${alertsTable.isActive} = true THEN 1 END`),
  }).from(alertsTable);

  const [zoneStats] = await db.select({
    zonesMonitored: count(),
  }).from(zonesTable);

  const [resourceStats] = await db.select({
    resourcesDeployed: count(sql`CASE WHEN ${resourcesTable.isAvailable} = false THEN 1 END`),
  }).from(resourcesTable);

  const [reportStats] = await db.select({
    citizenReportsPending: count(sql`CASE WHEN ${reportsTable.status} = 'pending' THEN 1 END`),
  }).from(reportsTable);

  res.json({
    activeIncidents: Number(incidentStats?.activeIncidents ?? 0),
    criticalAlerts: Number(alertStats?.criticalAlerts ?? 0),
    zonesMonitored: Number(zoneStats?.zonesMonitored ?? 0),
    resourcesDeployed: Number(resourceStats?.resourcesDeployed ?? 0),
    averageRiskScore: parseFloat(String(incidentStats?.averageRiskScore ?? 0)),
    totalAreaAffectedHa: parseFloat(String(incidentStats?.totalAreaAffectedHa ?? 0)),
    citizenReportsPending: Number(reportStats?.citizenReportsPending ?? 0),
    containedToday: Number(incidentStats?.containedToday ?? 0),
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const activities = await db.select().from(activityTable).orderBy(desc(activityTable.timestamp)).limit(20);
  res.json(activities);
});

router.get("/dashboard/fire-risk-trend", async (_req, res): Promise<void> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const rawData = await db.select({
    date: sql<string>`DATE(${incidentsTable.createdAt})::text`,
    avgRiskScore: avg(incidentsTable.riskScore),
    incidentCount: count(),
    maxSeverity: sql<string>`MAX(${incidentsTable.severity})`,
  })
    .from(incidentsTable)
    .where(gte(incidentsTable.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(${incidentsTable.createdAt})`)
    .orderBy(sql`DATE(${incidentsTable.createdAt})`);

  // Fill in any missing days
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = rawData.find((r) => r.date === dateStr);
    trend.push({
      date: dateStr,
      avgRiskScore: found ? parseFloat(String(found.avgRiskScore ?? 0)) : 0,
      incidentCount: found ? Number(found.incidentCount) : 0,
      maxSeverity: found?.maxSeverity ?? "none",
    });
  }

  res.json(trend);
});

router.get("/dashboard/incident-stats", async (_req, res): Promise<void> => {
  const bySeverity = await db.select({
    label: incidentsTable.severity,
    count: count(),
  }).from(incidentsTable).groupBy(incidentsTable.severity);

  const byStatus = await db.select({
    label: incidentsTable.status,
    count: count(),
  }).from(incidentsTable).groupBy(incidentsTable.status);

  const byFireType = await db.select({
    label: incidentsTable.fireType,
    count: count(),
  }).from(incidentsTable).groupBy(incidentsTable.fireType);

  res.json({
    bySeverity: bySeverity.map((r) => ({ label: r.label, count: Number(r.count) })),
    byStatus: byStatus.map((r) => ({ label: r.label, count: Number(r.count) })),
    byFireType: byFireType.map((r) => ({ label: r.label, count: Number(r.count) })),
  });
});

export default router;
