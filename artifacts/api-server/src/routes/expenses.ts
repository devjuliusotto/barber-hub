import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, expensesTable } from "@workspace/db";
import {
  ListExpensesQueryParams,
  CreateExpenseBody,
  UpdateExpenseBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/expenses", async (req, res): Promise<void> => {
  const query = ListExpensesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { barbershopId, month } = query.data;

  let conditions = [eq(expensesTable.barbershopId, barbershopId)];

  if (month) {
    const start = `${month}-01`;
    const d = new Date(`${month}-01`);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    const end = d.toISOString().split("T")[0];
    conditions.push(gte(expensesTable.date, start));
    conditions.push(lte(expensesTable.date, end));
  }

  const rows = await db.select().from(expensesTable).where(and(...conditions));
  res.json(rows.map(r => ({ ...r, amount: Number(r.amount) })));
});

router.post("/expenses", async (req, res): Promise<void> => {
  const body = CreateExpenseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const { barbershopId, amount, category, type, description, date } = body.data;
  const [created] = await db.insert(expensesTable).values({
    barbershopId,
    amount: String(amount),
    category: category as any,
    type: type as any,
    description: description ?? null,
    date,
  }).returning();
  res.status(201).json({ ...created, amount: Number(created.amount) });
});

router.patch("/expenses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const body = UpdateExpenseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (body.data.amount !== undefined) updates.amount = String(body.data.amount);
  if (body.data.category !== undefined) updates.category = body.data.category;
  if (body.data.type !== undefined) updates.type = body.data.type;
  if (body.data.description !== undefined) updates.description = body.data.description;
  if (body.data.date !== undefined) updates.date = body.data.date;

  const [updated] = await db.update(expensesTable).set(updates).where(eq(expensesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, amount: Number(updated.amount) });
});

router.delete("/expenses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
  res.status(204).send();
});

export default router;
