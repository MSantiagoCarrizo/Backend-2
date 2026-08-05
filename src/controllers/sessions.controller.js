import sessionsService from "../services/sessions.service.js";

export const getSessions = async (req, res, next) => {
    try {
        return res.status(200).json({ status: "success", message: "Sessions endpoint" });
    } catch (error) {
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const user = await sessionsService.register(req.body);

        return res.status(201).json({ status: "success", payload: user });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { token } = await sessionsService.login(req.body);

        res.cookie("currentUser", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({ status: "success", message: "Login correcto" });
    } catch (error) {
        next(error);
    }
};