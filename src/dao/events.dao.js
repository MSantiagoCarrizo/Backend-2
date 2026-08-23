import Event from "../models/Event.js";

class EventsDAO {
    async createEvent(eventData) {
        return await Event.create(eventData);
    }

    async getEvents() {
        return await Event.find();
    }

    async getEventById(id) {
        return await Event.findById(id);
    }

    async updateEvent(id, eventData) {
        return await Event.findByIdAndUpdate(id, eventData, { new: true });
    }
}

export default new EventsDAO();