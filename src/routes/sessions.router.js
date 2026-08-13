import { Router } from "express";
import { getSessions, register, login, current, logout } from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

router.get("/", getSessions);
router.post("/register",
    passport.authenticate("register", { session: false }),
    register
);
router.post("/login", login);
router.get("/current", authMiddleware, current);
router.post("/logout", authMiddleware, logout);

export default router;
