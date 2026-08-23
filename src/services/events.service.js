import eventsRepository from "../repositories/events.repository.js";

class EventsService {
    async getEvents() {
        return await eventsRepository.getEvents();
    }

    async createEvent(eventData, organizerId) {
        const { title, description, date, location, capacity } = eventData;

        if (!title || !date || !location) {
            const error = new Error("Faltan campos obligatorios");
            error.statusCode = 400;
            throw error;
        }

        const newEvent = await eventsRepository.createEvent({
            title,
            description,
            date,
            location,
            capacity,
            organizer: organizerId
        });

        return newEvent;
    }
}

export default new EventsService();