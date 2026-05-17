import { pgTable, text, serial, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const barbershopsTable = pgTable("barbershops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  city: text("city").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  coverImage: text("cover_image"),
  photos: text("photos").array().notNull().default([]),
  specialties: text("specialties").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  nationalityFlag: text("nationality_flag").notNull().default("🇩🇪"),
  nationalityLabel: text("nationality_label"),
  isPremium: boolean("is_premium").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBarbershopSchema = createInsertSchema(barbershopsTable).omit({ id: true, createdAt: true });
export type InsertBarbershop = z.infer<typeof insertBarbershopSchema>;
export type Barbershop = typeof barbershopsTable.$inferSelect;
