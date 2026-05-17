import { Router, type IRouter } from "express";
import { eq, ilike, gte, and, type SQL } from "drizzle-orm";
import { db, barbershopsTable, barbersTable, servicesTable, appointmentsTable, clientsTable } from "@workspace/db";
import {
  CreateBarbershopBody,
  UpdateBarbershopBody,
  UpdateBarbershopParams,
  GetBarbershopParams,
  GetBarbershopStatsParams,
  ListBarbershopsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/barbershops", async (req, res): Promise<void> => {
  const query = ListBarbershopsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success) {
    if (query.data.city) conditions.push(ilike(barbershopsTable.city, `%${query.data.city}%`));
    if (query.data.ownerId) conditions.push(eq(barbershopsTable.ownerId, query.data.ownerId));
  }
  const rows = await db
    .select()
    .from(barbershopsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(barbershopsTable.id);
  res.json(rows.map(r => ({ ...r, photos: r.photos ?? [] })));
});

router.post("/barbershops", async (req, res): Promise<void> => {
  const parsed = CreateBarbershopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(barbershopsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/barbershops/:id", async (req, res): Promise<void> => {
  const params = GetBarbershopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(barbershopsTable).where(eq(barbershopsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Barbershop not found" });
    return;
  }
  res.json(row);
});

router.patch("/barbershops/:id", async (req, res): Promise<void> => {
  const params = UpdateBarbershopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBarbershopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(barbershopsTable).set(parsed.data).where(eq(barbershopsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Barbershop not found" });
    return;
  }
  res.json(row);
});

router.get("/barbershops/:id/stats", async (req, res): Promise<void> => {
  const params = GetBarbershopStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const shopId = params.data.id;

  const appointments = await db.select().from(appointmentsTable).where(eq(appointmentsTable.barbershopId, shopId));
  const clients = await db.select().from(clientsTable).where(eq(clientsTable.barbershopId, shopId));

  const completed = appointments.filter(a => a.status === "completed");
  const totalRevenue = completed.reduce((sum, a) => sum + a.price, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyCompleted = completed.filter(a => new Date(a.scheduledAt) >= monthStart);
  const monthlyRevenue = monthlyCompleted.reduce((sum, a) => sum + a.price, 0);
  const newClientsMonth = clients.filter(c => c.createdAt >= monthStart).length;

  const serviceCounts: Record<number, number> = {};
  for (const a of completed) serviceCounts[a.serviceId] = (serviceCounts[a.serviceId] ?? 0) + 1;
  const topServiceId = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
  let topService: string | null = null;
  if (topServiceId) {
    const [svc] = await db.select().from(servicesTable).where(eq(servicesTable.id, Number(topServiceId)));
    topService = svc?.name ?? null;
  }

  const [shop] = await db.select().from(barbershopsTable).where(eq(barbershopsTable.id, shopId));

  res.json({
    totalRevenue,
    monthlyRevenue,
    totalAppointments: appointments.length,
    completedAppointments: completed.length,
    totalClients: clients.length,
    newClientsThisMonth: newClientsMonth,
    avgRating: shop?.rating ?? 0,
    topService,
  });
});

export default router;
