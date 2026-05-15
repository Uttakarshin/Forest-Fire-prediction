import { pgTable, text, serial, timestamp, real, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incidentsTable = pgTable("incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  severity: text("severity").notNull().default("moderate"),
  status: text("status").notNull().default("active"),
  fireType: text("fire_type").notNull().default("unknown"),
  areaAffectedHa: real("area_affected_ha").notNull().default(0),
  riskScore: real("risk_score").notNull().default(0),
  windSpeed: real("wind_speed"),
  humidity: real("humidity"),
  temperature: real("temperature"),
  reportedBy: text("reported_by"),
  assignedTeam: text("assigned_team"),
  evacuationOrdered: boolean("evacuation_ordered").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertIncidentSchema = createInsertSchema(incidentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidentsTable.$inferSelect;
