import Event from "../models/Event.js";

class EventsDAO {
    async createEvent(eventData) {
        return await Event.create(eventData);
    }

    async getEvents() {
        return await Event.find();
    }
}

export default new EventsDAO();