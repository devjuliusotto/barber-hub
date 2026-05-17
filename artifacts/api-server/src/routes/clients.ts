import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, clientsTable } from "@workspace/db";
import {
  CreateClientBody,
  UpdateClientBody,
  UpdateClientParams,
  GetClientParams,
  ListClientsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clients", async (req, res): Promise<void> => {
  const query = ListClientsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success) {
    if (query.data.barbershopId) conditions.push(eq(clientsTable.barbershopId, query.data.barbershopId));
    if (query.data.q) conditions.push(ilike(clientsTable.name, `%${query.data.q}%`));
  }
  const rows = await db.select().from(clientsTable).where(conditions.length ? and(...conditions) : undefined);
  res.json(rows);
});

router.post("/clients", async (req, res): Promise<void> => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(clientsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/clients/:id", async (req, res): Promise<void> => {
  const params = GetClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(clientsTable).where(eq(clientsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json(row);
});

router.patch("/clients/:id", async (req, res): Promise<void> => {
  const params = UpdateClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(clientsTable).set(parsed.data).where(eq(clientsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json(row);
});

export default router;
