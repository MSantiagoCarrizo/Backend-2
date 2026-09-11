import ticketsService from "../services/tickets.service.js";
import { TicketResponseDTO } from "../dto/ticket-response.dto.js";

export const createTicket = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const { quantity } = req.body;

        const ticket = await ticketsService.createTicket(eid, req.user, quantity);

        return res.status(201).json({ status: "success", payload: new TicketResponseDTO(ticket) });
    } catch (error) {
        next(error);
    }
};

export const getMyTickets = async (req, res, next) => {
    try {
        const tickets = await ticketsService.getMyTickets(req.user.id);

        const ticketsDTO = tickets.map((ticket) => new TicketResponseDTO(ticket));

        return res.status(200).json({ status: "success", payload: ticketsDTO });
    } catch (error) {
        next(error);
    }
};

export const getEventTickets = async (req, res, next) => {
    try {
        const { eid } = req.params;

        const tickets = await ticketsService.getEventTickets(eid);

        const ticketsDTO = tickets.map((ticket) => new TicketResponseDTO(ticket));

        return res.status(200).json({ status: "success", payload: ticketsDTO });
    } catch (error) {
        next(error);
    }
};

export const cancelTicket = async (req, res, next) => {
    try {
        const { tid } = req.params;

        const ticket = await ticketsService.cancelTicket(tid, req.user);

        return res.status(200).json({ status: "success", payload: new TicketResponseDTO(ticket) });
    } catch (error) {
        next(error);
    }
};