import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";
import categoriesRepository from "../repositories/categories.repository.js";

class EventsService {
    async getEvents() {
        return await eventsRepository.getEvents();
    }

    async createEvent(eventData, organizerId) {
        const { title, description, category, date, location, capacity, price } = eventData;

        if (!title || !description || !category || !date || !location || capacity === undefined) {
            const error = new Error("Faltan campos obligatorios");
            error.statusCode = 400;
            throw error;
        }

        if (Number(capacity) <= 0) {
            const error = new Error("La capacidad debe ser mayor a cero");
            error.statusCode = 400;
            throw error;
        }

        if (price !== undefined && Number(price) < 0) {
            const error = new Error("El precio no puede ser negativo");
            error.statusCode = 400;
            throw error;
        }

        const eventDate = new Date(date);

        if (isNaN(eventDate.getTime())) {
            const error = new Error("La fecha del evento no es válida");
            error.statusCode = 400;
            throw error;
        }

        if (eventDate <= new Date()) {
            const error = new Error("La fecha del evento debe ser futura");
            error.statusCode = 400;
            throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            const error = new Error("La categoría indicada no existe");
            error.statusCode = 400;
            throw error;
        }

        const categoryExists = await categoriesRepository.getCategoryById(category);

        if (!categoryExists) {
            const error = new Error("La categoría indicada no existe");
            error.statusCode = 400;
            throw error;
        }

        const newEvent = await eventsRepository.createEvent({
            title,
            description,
            category,
            date: eventDate,
            location,
            capacity,
            price: price ?? 0,
            organizer: organizerId
        });

        return newEvent;
    }

    async getEventById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Evento no encontrado");
            error.statusCode = 404;
            throw error;
        }

        const event = await eventsRepository.getEventById(id);

        if (!event) {
            const error = new Error("Evento no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return event;
    }

    async updateEvent(id, eventData) {
        const { title, description, date, location, capacity } = eventData;

        return await eventsRepository.updateEvent(id, {
            title,
            description,
            date,
            location,
            capacity
        });
    }
}

export default new EventsService();