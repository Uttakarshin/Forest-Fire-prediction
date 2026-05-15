import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import {
  ListResourcesQueryParams,
  CreateResourceBody,
  UpdateResourceParams,
  UpdateResourceBody,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/resources", async (req, res): Promise<void> => {
  const query = ListResourcesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(resourcesTable).$dynamic();
  if (query.data.type) {
    dbQuery = dbQuery.where(eq(resourcesTable.resourceType, query.data.type));
  }
  if (query.data.available !== undefined) {
    dbQuery = dbQuery.where(eq(resourcesTable.isAvailable, query.data.available));
  }

  const resources = await dbQuery.orderBy(desc(resourcesTable.createdAt));
  res.json(resources);
});

router.post("/resources", async (req, res): Promise<void> => {
  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [resource] = await db.insert(resourcesTable).values({
    ...data,
    isAvailable: true,
  }).returning();

  await logActivity({
    type: "resource_deployed",
    message: `New resource added: ${data.name} (${data.resourceType})`,
    severity: "info",
    relatedId: resource.id,
  });

  res.status(201).json(resource);
});

router.patch("/resources/:id", async (req, res): Promise<void> => {
  const params = UpdateResourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resource] = await db.update(resourcesTable)
    .set(parsed.data)
    .where(eq(resourcesTable.id, params.data.id))
    .returning();

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.json(resource);
});

export default router;
