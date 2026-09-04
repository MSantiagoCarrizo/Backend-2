import { transporter } from "../config/mailer.config.js";

class MailService {
    async sendTicketConfirmationEmail({ to, userName, eventTitle, reservationCode }) {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject: "Confirmación de inscripción",
            html: `
                <h1>Inscripción confirmada</h1>
                <p>Hola ${userName}, tu inscripción al evento <strong>${eventTitle}</strong> fue confirmada.</p>
                <p>Código de reserva: <strong>${reservationCode}</strong></p>
            `
        });
    }

    async sendTicketCancellationEmail({ to, userName, eventTitle, reservationCode }) {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject: "Cancelación de inscripción",
            html: `
                <h1>Inscripción cancelada</h1>
                <p>Hola ${userName}, tu inscripción al evento <strong>${eventTitle}</strong> fue cancelada.</p>
                <p>Código de reserva: <strong>${reservationCode}</strong></p>
            `
        });
    }
}

export default new MailService();