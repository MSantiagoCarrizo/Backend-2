import eventsDAO from "../dao/events.dao.js";

class EventsRepository {
    async createEvent(eventData) {
        return await eventsDAO.createEvent(eventData);
    }

    async getEvents() {
        return await eventsDAO.getEvents();
    }

    async getEventById(id) {
        return await eventsDAO.getEventById(id);
    }

    async updateEvent(id, eventData) {
        return await eventsDAO.updateEvent(id, eventData);
    }
}

export default new EventsRepository();