import { Router, type IRouter } from "express";
import healthRouter from "./health";
import incidentsRouter from "./incidents";
import alertsRouter from "./alerts";
import zonesRouter from "./zones";
import weatherRouter from "./weather";
import reportsRouter from "./reports";
import resourcesRouter from "./resources";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(incidentsRouter);
router.use(alertsRouter);
router.use(zonesRouter);
router.use(weatherRouter);
router.use(reportsRouter);
router.use(resourcesRouter);
router.use(dashboardRouter);

export default router;
