export const health = (req, res) => {
    res.status(200).json({ status: "ok", message: "Servidor activo" });
};