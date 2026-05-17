import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, appointmentsTable, barbersTable, servicesTable, clientsTable, barbershopsTable } from "@workspace/db";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  UpdateAppointmentParams,
  GetAppointmentParams,
  ListAppointmentsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichAppointment(a: typeof appointmentsTable.$inferSelect) {
  const [barber] = await db.select().from(barbersTable).where(eq(barbersTable.id, a.barberId));
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, a.serviceId));
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, a.clientId));
  const [shop] = await db.select().from(barbershopsTable).where(eq(barbershopsTable.id, a.barbershopId));
  return {
    ...a,
    barberName: barber?.name ?? null,
    serviceName: service?.name ?? null,
    clientName: client?.name ?? null,
    clientPhone: client?.phone ?? null,
    barbershopName: shop?.name ?? null,
  };
}

/** Award loyalty points and update stats when an appointment is completed. */
async function awardLoyaltyPoints(appointment: typeof appointmentsTable.$inferSelect) {
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, appointment.clientId));
  if (!client) return;

  const pointsEarned = Math.floor(appointment.price); // 1 pt per €1 spent
  const completedAppts = await db
    .select()
    .from(appointmentsTable)
    .where(and(eq(appointmentsTable.clientId, client.id), eq(appointmentsTable.status, "completed")));

  const totalSpent = completedAppts.reduce((sum, a) => sum + a.price, 0);
  const totalVisits = completedAppts.length;

  await db.update(clientsTable)
    .set({
      loyaltyPoints: (client.loyaltyPoints ?? 0) + pointsEarned,
      totalSpent,
      totalVisits,
      lastVisit: appointment.scheduledAt,
    })
    .where(eq(clientsTable.id, client.id));
}

router.get("/appointments", async (req, res): Promise<void> => {
  const query = ListAppointmentsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success) {
    if (query.data.barbershopId) conditions.push(eq(appointmentsTable.barbershopId, query.data.barbershopId));
    if (query.data.barberId) conditions.push(eq(appointmentsTable.barberId, query.data.barberId));
    if (query.data.clientId) conditions.push(eq(appointmentsTable.clientId, query.data.clientId));
    if (query.data.status) conditions.push(eq(appointmentsTable.status, query.data.status));
  }
  const rows = await db.select().from(appointmentsTable).where(conditions.length ? and(...conditions) : undefined);
  const enriched = await Promise.all(rows.map(enrichAppointment));
  res.json(enriched);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(appointmentsTable).values(parsed.data).returning();
  res.status(201).json(await enrichAppointment(row));
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(await enrichAppointment(row));
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Fetch the appointment before updating to detect status transitions
  const [before] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
  if (!before) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [row] = await db
    .update(appointmentsTable)
    .set(parsed.data)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  // Award loyalty points only when transitioning TO completed
  if (parsed.data.status === "completed" && before.status !== "completed") {
    await awardLoyaltyPoints(row);
  }

  res.json(await enrichAppointment(row));
});

export default router;
