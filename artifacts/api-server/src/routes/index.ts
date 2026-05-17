import { Router, type IRouter } from "express";
import healthRouter from "./health";
import barbershopsRouter from "./barbershops";
import barbersRouter from "./barbers";
import servicesRouter from "./services";
import appointmentsRouter from "./appointments";
import clientsRouter from "./clients";
import reviewsRouter from "./reviews";
import marketplaceRouter from "./marketplace";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketplaceRouter);
router.use(barbershopsRouter);
router.use(barbersRouter);
router.use(servicesRouter);
router.use(appointmentsRouter);
router.use(clientsRouter);
router.use(reviewsRouter);
router.use(dashboardRouter);

export default router;
