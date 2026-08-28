import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";
import categoriesRepository from "../repositories/categories.repository.js";

class EventsService {
    async getEvents(query = {}) {
        const {
            status,
            category,
            location,
            dateFrom,
            dateTo,
            search,
            page = 1,
            limit = 10,
            sort = "date"
        } = query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (category && mongoose.Types.ObjectId.isValid(category)) {
            filter.category = category;
        }

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) filter.date.$gte = new Date(dateFrom);
            if (dateTo) filter.date.$lte = new Date(dateTo);
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const allowedSortFields = ["date", "title", "price", "capacity", "createdAt"];
        const sortField = String(sort).replace(/^-/, "");
        const sortOption = allowedSortFields.includes(sortField) ? sort : "date";

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const skip = (pageNumber - 1) * limitNumber;

        const [data, total] = await Promise.all([
            eventsRepository.getEvents(filter, { skip, limit: limitNumber, sort: sortOption }),
            eventsRepository.countEvents(filter)
        ]);

        return {
            data,
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: limitNumber > 0 ? Math.ceil(total / limitNumber) : 0
        };
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