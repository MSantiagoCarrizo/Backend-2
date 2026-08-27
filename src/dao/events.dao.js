import Event from "../models/Event.js";

class EventsDAO {
    async createEvent(eventData) {
        return await Event.create(eventData);
    }

    async getEvents() {
        return await Event.find();
    }

    async getEventById(id) {
        return await Event.findById(id)
            .populate("category")
            .populate("organizer", "first_name last_name email");
    }

    async updateEvent(id, eventData) {
        return await Event.findByIdAndUpdate(id, eventData, {
            new: true,
            runValidators: true
        });
    }
}

export default new EventsDAO();