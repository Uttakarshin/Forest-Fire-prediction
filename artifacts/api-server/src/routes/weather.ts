import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, weatherTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/weather", async (_req, res): Promise<void> => {
  const readings = await db.select().from(weatherTable).orderBy(desc(weatherTable.recordedAt));
  res.json(readings);
});

router.get("/weather/current", async (_req, res): Promise<void> => {
  const [latest] = await db.select().from(weatherTable).orderBy(desc(weatherTable.recordedAt)).limit(1);
  if (!latest) {
    res.status(404).json({ error: "No weather data available" });
    return;
  }
  res.json(latest);
});

export default router;
