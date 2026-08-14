import { generateToken } from "../utils/jwt.js";

export const getSessions = async (req, res, next) => {
    try {
        return res.status(200).json({
            status: "success",
            message: "Sessions endpoint"
        });
    } catch (error) {
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const user = req.user;

        return res.status(201).json({
            status: "success",
            payload: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const tokenUser = {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        };

        const token = generateToken(tokenUser);

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

export const current = (req, res, next) => {
    try {
        const { id, email, role } = req.user;

        return res.status(200).json({
            status: "success",
            payload: {
                id,
                email,
                role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res, next) => {
    try {
        res.clearCookie("currentUser");

        return res.status(200).json({
            status: "success",
            message: "Sesión cerrada"
        });
    } catch (error) {
        next(error);
    }
};