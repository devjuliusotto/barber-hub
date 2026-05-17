import { pgTable, serial, integer, numeric, text, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { barbershopsTable } from "./barbershops";

export const expenseCategoryEnum = pgEnum("expense_category", [
  "rent",
  "salaries",
  "supplies",
  "utilities",
  "marketing",
  "equipment",
  "maintenance",
  "insurance",
  "taxes",
  "other",
]);

export const expenseTypeEnum = pgEnum("expense_type", ["fixed", "variable"]);

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  barbershopId: integer("barbershop_id")
    .notNull()
    .references(() => barbershopsTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: expenseCategoryEnum("category").notNull().default("other"),
  type: expenseTypeEnum("type").notNull().default("variable"),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
