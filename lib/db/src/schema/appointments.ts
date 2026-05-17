import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  barberId: integer("barber_id").notNull(),
  serviceId: integer("service_id").notNull(),
  barbershopId: integer("barbershop_id").notNull(),
  scheduledAt: text("scheduled_at").notNull(),
  status: text("status").notNull().default("pending"),
  price: real("price").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
