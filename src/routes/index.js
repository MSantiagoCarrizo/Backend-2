import { Router } from "express";
import eventsRouter from "./events.router.js";
import sessionsRouter from "./sessions.router.js";
import healthRouter from "./health.router.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/events", eventsRouter);
router.use("/sessions", sessionsRouter);

export default router;