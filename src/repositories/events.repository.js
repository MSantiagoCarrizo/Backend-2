import eventsDAO from "../dao/events.dao.js";

class EventsRepository {
    async createEvent(eventData) {
        return await eventsDAO.createEvent(eventData);
    }

    async getEvents(filter, options) {
        return await eventsDAO.getEvents(filter, options);
    }

    async countEvents(filter) {
        return await eventsDAO.countEvents(filter);
    }

    async getEventById(id) {
        return await eventsDAO.getEventById(id);
    }

    async updateEvent(id, eventData) {
        return await eventsDAO.updateEvent(id, eventData);
    }
}

export default new EventsRepository();