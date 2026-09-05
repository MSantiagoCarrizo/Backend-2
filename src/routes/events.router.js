import { Router } from "express";
import { getEvents, getEventById, createEvent, updateEvent, updateEventStatus } from "../controllers/events.controller.js";
import { createTicket, getEventTickets } from "../controllers/tickets.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { authorizeEventOwnerOrAdmin, authorizeEventOrganizerOrAdmin } from "../middlewares/eventOwnership.middleware.js";

const router = Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

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

router.patch(
    "/:id/status",
    auth,
    authorizeRoles("organizer", "admin"),
    authorizeEventOwnerOrAdmin,
    updateEventStatus
);

router.post(
    "/:eid/tickets",
    auth,
    createTicket
);

router.get(
    "/:eid/tickets",
    auth,
    authorizeRoles("organizer", "admin"),
    authorizeEventOrganizerOrAdmin,
    getEventTickets
);

export default router;