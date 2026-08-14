import { Router } from "express";
import { getSessions, register, login, current, logout } from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

router.get("/", getSessions);
router.post(
    "/register",
    { session: false },
    (req, res, next) => {
        passport.authenticate(
            "register",
            { session: false },
            (error, user, info) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    const authError = new Error(
                        info?.message || "Error en el registro"
                    );

                    if (info?.message === "El email ya está registrado") {
                        authError.statusCode = 409;
                    } else {
                        authError.statusCode = 400;
                    }

                    return next(authError);
                }

                req.user = user;
                next();
            }
        )(req, res, next);
    },
    register
);
router.post(
    "/login",
    { session: false },
    (req, res, next) => {
        passport.authenticate(
            "login",
            { session: false },
            (error, user, info) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    const authError = new Error(
                        info?.message || "Credenciales inválidas"
                    );

                    authError.statusCode = 401;

                    return next(authError);
                }

                req.user = user;
                next();
            }
        )(req, res, next);
    },
    login
);
router.get("/current", authMiddleware, current);
router.post("/logout", authMiddleware, logout);

export default router;
