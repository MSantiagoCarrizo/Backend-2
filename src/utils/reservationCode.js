export const generateReservationCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `TCK-${random}`;
};