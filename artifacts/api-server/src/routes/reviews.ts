import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, reviewsTable, barbershopsTable } from "@workspace/db";
import {
  CreateReviewBody,
  ListReviewsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const query = ListReviewsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success) {
    if (query.data.barbershopId) conditions.push(eq(reviewsTable.barbershopId, query.data.barbershopId));
    if (query.data.barberId) conditions.push(eq(reviewsTable.barberId, query.data.barberId));
  }
  const rows = await db.select().from(reviewsTable).where(conditions.length ? and(...conditions) : undefined);
  res.json(rows);
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(reviewsTable).values(parsed.data).returning();

  // Update barbershop average rating
  const allReviews = await db.select().from(reviewsTable).where(eq(reviewsTable.barbershopId, row.barbershopId));
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await db.update(barbershopsTable)
    .set({ rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length })
    .where(eq(barbershopsTable.id, row.barbershopId));

  res.status(201).json(row);
});

export default router;
