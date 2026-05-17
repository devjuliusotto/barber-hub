import { Router, type IRouter } from "express";
import { eq, gte, ilike, and, type SQL } from "drizzle-orm";
import { db, barbershopsTable } from "@workspace/db";
import { SearchBarbershopsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/marketplace/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(barbershopsTable)
    .where(eq(barbershopsTable.isVerified, true))
    .limit(6);
  res.json(rows.map(r => ({ ...r, photos: r.photos ?? [] })));
});

router.get("/marketplace/search", async (req, res): Promise<void> => {
  const query = SearchBarbershopsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success) {
    if (query.data.city) conditions.push(ilike(barbershopsTable.city, `%${query.data.city}%`));
    if (query.data.nationality) conditions.push(ilike(barbershopsTable.nationalityLabel, `%${query.data.nationality}%`));
    if (query.data.language) {
      // languages is an array — check via SQL cast
    }
    if (query.data.minRating) conditions.push(gte(barbershopsTable.rating, query.data.minRating));
    if (query.data.q) conditions.push(ilike(barbershopsTable.name, `%${query.data.q}%`));
  }
  const rows = await db
    .select()
    .from(barbershopsTable)
    .where(conditions.length ? and(...conditions) : undefined);
  res.json(rows.map(r => ({ ...r, photos: r.photos ?? [] })));
});

export default router;
