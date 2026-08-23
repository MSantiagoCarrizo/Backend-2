import eventsService from "../services/events.service.js";

export const getEvents = async (req, res, next) => {
    try {
        const events = await eventsService.getEvents();

        return res.status(200).json({ status: "success", payload: events });
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        const newEvent = await eventsService.createEvent(req.body, req.user.id);

        return res.status(201).json({ status: "success", payload: newEvent });
    } catch (error) {
        next(error);
    }
};