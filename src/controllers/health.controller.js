export const health = async (req, res) => {
    try {
        res.status(200).json({ status: "ok", message: "Servidor activo" });
    } catch (error) {
        next(error);
    }
};