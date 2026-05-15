import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zonesTable = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  riskLevel: text("risk_level").notNull().default("moderate"),
  riskScore: real("risk_score").notNull().default(50),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radiusKm: real("radius_km").notNull().default(5),
  forestType: text("forest_type").notNull().default("mixed"),
  populationDensity: text("population_density"),
  lastAssessed: timestamp("last_assessed", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertZoneSchema = createInsertSchema(zonesTable).omit({ id: true, createdAt: true });
export type InsertZone = z.infer<typeof insertZoneSchema>;
export type Zone = typeof zonesTable.$inferSelect;
