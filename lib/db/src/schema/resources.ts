import { pgTable, text, serial, timestamp, real, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resourcesTable = pgTable("emergency_resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  resourceType: text("resource_type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("unit"),
  isAvailable: boolean("is_available").notNull().default(true),
  assignedIncidentId: integer("assigned_incident_id"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  contactInfo: text("contact_info"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resourcesTable).omit({ id: true, createdAt: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resourcesTable.$inferSelect;
