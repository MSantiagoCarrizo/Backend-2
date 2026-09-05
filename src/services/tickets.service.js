import ticketsRepository from "../repositories/tickets.repository.js";
import eventsRepository from "../repositories/events.repository.js";
import usersRepository from "../repositories/users.repository.js";
import mailService from "./mail.service.js";
import { generateReservationCode } from "../utils/reservationCode.js";

class TicketsService {
    async createTicket(eventId, user, quantity) {
        const event = await eventsRepository.getEventById(eventId);

        if (!event) {
            const error = new Error("Evento no encontrado");
            error.statusCode = 404;
            throw error;
        }

        if (event.status !== "published") {
            const error = new Error("El evento no está disponible para inscripciones");
            error.statusCode = 400;
            throw error;
        }

        if (event.date <= new Date()) {
            const error = new Error("No es posible inscribirse a un evento finalizado");
            error.statusCode = 400;
            throw error;
        }

        const parsedQuantity = quantity !== undefined ? Number(quantity) : 1;

        if (!parsedQuantity || parsedQuantity <= 0) {
            const error = new Error("La cantidad debe ser mayor a cero");
            error.statusCode = 400;
            throw error;
        }

        const existingTicket = await ticketsRepository.getActiveTicketByUserAndEvent(
            user.id,
            event._id
        );

        if (existingTicket) {
            const error = new Error("Ya tenés una inscripción activa para este evento");
            error.statusCode = 409;
            throw error;
        }

        const reserved = await ticketsRepository.getReservedQuantity(event._id);
        const available = event.capacity - reserved;

        if (parsedQuantity > available) {
            const error = new Error("No hay cupos suficientes disponibles");
            error.statusCode = 400;
            throw error;
        }

        const reservationCode = generateReservationCode();

        const ticket = await ticketsRepository.createTicket({
            user: user.id,
            event: event._id,
            quantity: parsedQuantity,
            reservationCode,
            status: "confirmed"
        });

        const fullUser = await usersRepository.getUserByEmail(user.email);

        try {
            await mailService.sendTicketConfirmationEmail({
                to: user.email,
                userName: fullUser.first_name,
                eventTitle: event.title,
                reservationCode
            });
        } catch (emailError) {
            console.error("No fue posible enviar el email de confirmación:", emailError.message);
        }

        return ticket;
    }

    async cancelTicket(ticketId, user) {
        const ticket = await ticketsRepository.getTicketById(ticketId);

        if (!ticket) {
            const error = new Error("Ticket no encontrado");
            error.statusCode = 404;
            throw error;
        }

        const isAdmin = user.role === "admin";
        const isOwner = ticket.user.toString() === user.id;

        if (!isAdmin && !isOwner) {
            const error = new Error("No tenés permisos para cancelar este ticket");
            error.statusCode = 403;
            throw error;
        }

        if (ticket.status === "cancelled") {
            const error = new Error("El ticket ya está cancelado");
            error.statusCode = 400;
            throw error;
        }

        const updatedTicket = await ticketsRepository.updateTicket(ticket._id, {
            status: "cancelled",
            cancelledAt: new Date()
        });

        const fullUser = await usersRepository.getUserByEmail(user.email);

        try {
            await mailService.sendTicketCancellationEmail({
                to: user.email,
                userName: fullUser.first_name,
                eventTitle: ticket.event.title,
                reservationCode: ticket.reservationCode
            });
        } catch (emailError) {
            console.error("No fue posible enviar el email de cancelación:", emailError.message);
        }

        return updatedTicket;
    }

    async getMyTickets(userId) {
        return await ticketsRepository.getTicketsByUser(userId);
    }

    async getEventTickets(eventId) {
        const event = await eventsRepository.getEventById(eventId);

        if (!event) {
            const error = new Error("Evento no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return await ticketsRepository.getTicketsByEvent(event._id);
    }
}

export default new TicketsService();