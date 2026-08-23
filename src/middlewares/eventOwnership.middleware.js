import eventsService from "../services/events.service.js";

export const authorizeEventOwnerOrAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await eventsService.getEventById(id);

        const isAdmin = req.user.role === "admin";
        const isOwner = event.organizer.toString() === req.user.id;

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

export default authorizeEventOwnerOrAdmin;