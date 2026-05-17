import { pgTable, text, serial, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const barbersTable = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  barbershopId: integer("barbershop_id").notNull(),
  nationality: text("nationality").notNull(),
  nationalityFlag: text("nationality_flag").notNull().default("🇩🇪"),
  specialties: text("specialties").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  avatarUrl: text("avatar_url"),
  yearsExperience: integer("years_experience"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBarberSchema = createInsertSchema(barbersTable).omit({ id: true, createdAt: true });
export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Barber = typeof barbersTable.$inferSelect;
