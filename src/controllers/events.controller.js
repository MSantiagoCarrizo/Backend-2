import eventsService from "../services/events.service.js";
import { EventResponseDTO } from "../dto/event-response.dto.js";

export const getEvents = async (req, res, next) => {
    try {
        const { data, page, limit, total, totalPages } = await eventsService.getEvents(req.query);

        const eventsDTO = data.map((event) => new EventResponseDTO(event));

        return res.status(200).json({
            status: "success",
            data: eventsDTO,
            page,
            limit,
            total,
            totalPages
        });
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await eventsService.getEventById(id);

        return res.status(200).json({ status: "success", payload: new EventResponseDTO(event) });
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        const newEvent = await eventsService.createEvent(req.body, req.user.id);

        return res.status(201).json({ status: "success", payload: new EventResponseDTO(newEvent) });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedEvent = await eventsService.updateEvent(id, req.body);

        return res.status(200).json({ status: "success", payload: new EventResponseDTO(updatedEvent) });
    } catch (error) {
        next(error);
    }
};

export const updateEventStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedEvent = await eventsService.updateEventStatus(id, status);

        return res.status(200).json({ status: "success", payload: new EventResponseDTO(updatedEvent) });
    } catch (error) {
        next(error);
    }
};