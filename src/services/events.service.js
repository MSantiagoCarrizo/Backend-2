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
        const event = await this.getEventById(id);

        if (event.status === "cancelled") {
            const error = new Error("No se puede modificar un evento cancelado");
            error.statusCode = 400;
            throw error;
        }

        if (event.status === "finished") {
            const error = new Error("No se puede modificar un evento que ya finalizó");
            error.statusCode = 400;
            throw error;
        }

        const { title, description, category, date, location, capacity, price } = eventData;
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (location !== undefined) updateData.location = location;

        if (category !== undefined) {
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

            updateData.category = category;
        }

        if (capacity !== undefined) {
            if (Number(capacity) <= 0) {
                const error = new Error("La capacidad debe ser mayor a cero");
                error.statusCode = 400;
                throw error;
            }
            updateData.capacity = capacity;
        }

        if (price !== undefined) {
            if (Number(price) < 0) {
                const error = new Error("El precio no puede ser negativo");
                error.statusCode = 400;
                throw error;
            }
            updateData.price = price;
        }

        if (date !== undefined) {
            const newDate = new Date(date);

            if (isNaN(newDate.getTime())) {
                const error = new Error("La fecha del evento no es válida");
                error.statusCode = 400;
                throw error;
            }

            if (newDate <= new Date()) {
                const error = new Error("La fecha del evento debe ser futura");
                error.statusCode = 400;
                throw error;
            }

            updateData.date = newDate;
        }

        return await eventsRepository.updateEvent(id, updateData);
    }

    async updateEventStatus(id, status) {
        const allowedStatuses = ["draft", "published", "cancelled", "finished"];

        if (!allowedStatuses.includes(status)) {
            const error = new Error("Estado inválido");
            error.statusCode = 400;
            throw error;
        }

        const event = await this.getEventById(id);

        if (event.status === "cancelled" || event.status === "finished") {
            const error = new Error("No se puede modificar el estado de un evento cancelado o finalizado");
            error.statusCode = 400;
            throw error;
        }

        if (status === "published" && event.date <= new Date()) {
            const error = new Error("No se puede publicar un evento que ya finalizó");
            error.statusCode = 400;
            throw error;
        }

        return await eventsRepository.updateEvent(id, { status });
    }
}

export default new EventsService();