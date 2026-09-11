export class TicketResponseDTO {
    constructor(ticket) {
        this.id = ticket._id;
        this.status = ticket.status;
        this.quantity = ticket.quantity;
        this.reservationCode = ticket.reservationCode;
        this.cancelledAt = ticket.cancelledAt;
        this.createdAt = ticket.createdAt;

        if (ticket.event?.title) {
            this.event = {
                id: ticket.event._id,
                title: ticket.event.title,
                date: ticket.event.date,
                location: ticket.event.location,
                status: ticket.event.status
            };
        } else if (ticket.event) {
            this.event = ticket.event;
        }

        if (ticket.user?.first_name) {
            this.user = {
                id: ticket.user._id,
                first_name: ticket.user.first_name,
                last_name: ticket.user.last_name,
                email: ticket.user.email
            };
        } else if (ticket.user) {
            this.user = ticket.user;
        }
    }
}