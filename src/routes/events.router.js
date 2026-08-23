import { Router } from "express";
import { getEvents, createEvent } from "../controllers/events.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getEvents);

router.post("/", auth, authorizeRoles("organizer", "admin"), createEvent);

export default router;