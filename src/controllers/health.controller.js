export const health = async (req, res) => {
    try {
        res.status(200).json({ status: "ok", message: "Servidor activo" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};