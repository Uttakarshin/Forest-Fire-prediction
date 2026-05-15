import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const weatherTable = pgTable("weather_readings", {
  id: serial("id").primaryKey(),
  stationName: text("station_name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  windDirection: text("wind_direction").notNull(),
  precipitation: real("precipitation").notNull().default(0),
  fireWeatherIndex: real("fire_weather_index").notNull().default(0),
  droughtCode: real("drought_code"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWeatherSchema = createInsertSchema(weatherTable).omit({ id: true });
export type InsertWeather = z.infer<typeof insertWeatherSchema>;
export type WeatherReading = typeof weatherTable.$inferSelect;
