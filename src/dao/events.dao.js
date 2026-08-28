import Event from "../models/Event.js";

class EventsDAO {
    async createEvent(eventData) {
        return await Event.create(eventData);
    }

    async getEvents(filter, { skip, limit, sort }) {
        return await Event.find(filter)
            .populate("category")
            .populate("organizer", "first_name last_name email")
            .sort(sort)
            .skip(skip)
            .limit(limit);
    }

    async countEvents(filter) {
        return await Event.countDocuments(filter);
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