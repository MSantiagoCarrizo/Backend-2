export const getEvents = async (req, res) => {
    try {
        res.status(200).json({ status: "success", payload: [] });
    } catch (error) {
        next(error);
    }
};