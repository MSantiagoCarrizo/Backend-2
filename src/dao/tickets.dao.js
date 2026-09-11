import Ticket from "../models/Ticket.js";

class TicketsDAO {
    async createTicket(ticketData) {
        return await Ticket.create(ticketData);
    }

    async getTicketById(id) {
        return await Ticket.findById(id).populate("event");
    }

    async getActiveTicketByUserAndEvent(userId, eventId) {
        return await Ticket.findOne({
            user: userId,
            event: eventId,
            status: "confirmed"
        });
    }

    async getTicketsByUser(userId) {
        return await Ticket.find({ user: userId })
            .populate("event", "title date location status");
    }

    async getTicketsByEvent(eventId) {
        return await Ticket.find({ event: eventId })
            .populate("user", "first_name last_name email");
    }

    async updateTicket(id, updateData) {
        return await Ticket.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
    }
}

export default new TicketsDAO();