import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, barbersTable, barbershopsTable } from "@workspace/db";
import {
  CreateBarberBody,
  UpdateBarberBody,
  UpdateBarberParams,
  GetBarberParams,
  ListBarbersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/barbers", async (req, res): Promise<void> => {
  const query = ListBarbersQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success && query.data.barbershopId) {
    conditions.push(eq(barbersTable.barbershopId, query.data.barbershopId));
  }
  const barbers = await db.select().from(barbersTable).where(conditions.length ? and(...conditions) : undefined);
  const shops = await db.select().from(barbershopsTable);
  const shopMap = new Map(shops.map(s => [s.id, s.name]));
  res.json(barbers.map(b => ({ ...b, barbershopName: shopMap.get(b.barbershopId) ?? null })));
});

router.post("/barbers", async (req, res): Promise<void> => {
  const parsed = CreateBarberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(barbersTable).values(parsed.data).returning();
  res.status(201).json({ ...row, barbershopName: null });
});

router.get("/barbers/:id", async (req, res): Promise<void> => {
  const params = GetBarberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [barber] = await db.select().from(barbersTable).where(eq(barbersTable.id, params.data.id));
  if (!barber) {
    res.status(404).json({ error: "Barber not found" });
    return;
  }
  const [shop] = await db.select().from(barbershopsTable).where(eq(barbershopsTable.id, barber.barbershopId));
  res.json({ ...barber, barbershopName: shop?.name ?? null });
});

router.patch("/barbers/:id", async (req, res): Promise<void> => {
  const params = UpdateBarberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBarberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(barbersTable).set(parsed.data).where(eq(barbersTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Barber not found" });
    return;
  }
  const [shop] = await db.select().from(barbershopsTable).where(eq(barbershopsTable.id, row.barbershopId));
  res.json({ ...row, barbershopName: shop?.name ?? null });
});

export default router;
