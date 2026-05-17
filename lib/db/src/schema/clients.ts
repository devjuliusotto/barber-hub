import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  barbershopId: integer("barbershop_id").notNull(),
  birthdate: text("birthdate"),
  notes: text("notes"),
  preferredBarberId: integer("preferred_barber_id"),
  lastVisit: text("last_visit"),
  totalVisits: integer("total_visits").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({ id: true, createdAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
