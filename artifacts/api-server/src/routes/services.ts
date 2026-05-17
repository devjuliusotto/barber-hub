import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import {
  CreateServiceBody,
  UpdateServiceBody,
  UpdateServiceParams,
  GetServiceParams,
  DeleteServiceParams,
  ListServicesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  const query = ListServicesQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success && query.data.barbershopId) {
    conditions.push(eq(servicesTable.barbershopId, query.data.barbershopId));
  }
  const rows = await db.select().from(servicesTable).where(conditions.length ? and(...conditions) : undefined);
  res.json(rows);
});

router.post("/services", async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(servicesTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(servicesTable).where(eq(servicesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(row);
});

router.patch("/services/:id", async (req, res): Promise<void> => {
  const params = UpdateServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(servicesTable).set(parsed.data).where(eq(servicesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(row);
});

router.delete("/services/:id", async (req, res): Promise<void> => {
  const params = DeleteServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(servicesTable).where(eq(servicesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
