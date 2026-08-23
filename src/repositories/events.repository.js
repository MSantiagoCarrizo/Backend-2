import eventsDAO from "../dao/events.dao.js";

class EventsRepository {
    async createEvent(eventData) {
        return await eventsDAO.createEvent(eventData);
    }

    async getEvents() {
        return await eventsDAO.getEvents();
    }
}

export default new EventsRepository();