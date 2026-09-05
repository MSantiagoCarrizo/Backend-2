import eventsService from "../services/events.service.js";

export const authorizeEventOwnerOrAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await eventsService.getEventById(id);

        const isAdmin = req.user.role === "admin";
        const organizerId = event.organizer?._id
            ? event.organizer._id.toString()
            : event.organizer.toString();

        const isOwner = organizerId === req.user.id;

        if (!isAdmin && !isOwner) {
            const authError = new Error(
                "No tenés permisos para modificar este evento"
            );
            authError.statusCode = 403;
            return next(authError);
        }

        req.event = event;
        next();
    } catch (error) {
        next(error);
    }
};

export const authorizeEventOrganizerOrAdmin = async (req, res, next) => {
    try {
        const { eid } = req.params;

        const event = await eventsService.getEventById(eid);

        const isAdmin = req.user.role === "admin";
        const organizerId = event.organizer?._id
            ? event.organizer._id.toString()
            : event.organizer.toString();

        const isOwner = organizerId === req.user.id;

        if (!isAdmin && !isOwner) {
            const authError = new Error(
                "No tenés permisos para ver las inscripciones de este evento"
            );
            authError.statusCode = 403;
            return next(authError);
        }

        req.event = event;
        next();
    } catch (error) {
        next(error);
    }
};

export default authorizeEventOwnerOrAdmin;