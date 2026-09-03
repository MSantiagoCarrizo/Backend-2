import ticketsDAO from "../dao/tickets.dao.js";

class TicketsRepository {
    async createTicket(ticketData) {
        return await ticketsDAO.createTicket(ticketData);
    }

    async getTicketById(id) {
        return await ticketsDAO.getTicketById(id);
    }

    async getActiveTicketByUserAndEvent(userId, eventId) {
        return await ticketsDAO.getActiveTicketByUserAndEvent(userId, eventId);
    }

    async getReservedQuantity(eventId) {
        return await ticketsDAO.getReservedQuantity(eventId);
    }

    async getTicketsByUser(userId) {
        return await ticketsDAO.getTicketsByUser(userId);
    }

    async getTicketsByEvent(eventId) {
        return await ticketsDAO.getTicketsByEvent(eventId);
    }

    async updateTicket(id, updateData) {
        return await ticketsDAO.updateTicket(id, updateData);
    }
}

export default new TicketsRepository();