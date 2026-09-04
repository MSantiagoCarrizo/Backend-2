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
}

export default new TicketsService();