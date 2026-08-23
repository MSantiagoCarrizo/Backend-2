import { Router } from "express";
import { getEvents, createEvent, updateEvent } from "../controllers/events.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { authorizeEventOwnerOrAdmin } from "../middlewares/eventOwnership.middleware.js";

const router = Router();

router.get("/", getEvents);

router.post(
    "/",
    auth,
    authorizeRoles("organizer", "admin"),
    createEvent
);

router.put( 
    "/:id",
    auth,
    authorizeRoles("organizer", "admin"),
    authorizeEventOwnerOrAdmin,
    updateEvent
);

export default router;