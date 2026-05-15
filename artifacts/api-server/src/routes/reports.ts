import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  UpdateReportParams,
  UpdateReportBody,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/reports", async (req, res): Promise<void> => {
  const query = ListReportsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(reportsTable).$dynamic();
  if (query.data.status) {
    dbQuery = dbQuery.where(eq(reportsTable.status, query.data.status));
  }

  const reports = await dbQuery.orderBy(desc(reportsTable.createdAt));
  res.json(reports);
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [report] = await db.insert(reportsTable).values({
    ...data,
    status: "pending",
    smokeDetected: data.smokeDetected ?? false,
    flamesVisible: data.flamesVisible ?? false,
  }).returning();

  await logActivity({
    type: "report_submitted",
    message: `Citizen report submitted by ${data.reporterName}`,
    severity: data.flamesVisible ? "danger" : "warning",
    relatedId: report.id,
  });

  res.status(201).json(report);
});

router.patch("/reports/:id", async (req, res): Promise<void> => {
  const params = UpdateReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db.update(reportsTable)
    .set(parsed.data)
    .where(eq(reportsTable.id, params.data.id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(report);
});

export default router;
