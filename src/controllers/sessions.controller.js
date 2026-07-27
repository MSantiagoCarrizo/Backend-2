export const getSessions = async (req, res) => {
    try {
        res.status(200).json({ status: "success", message: "Sessions endpoint" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};