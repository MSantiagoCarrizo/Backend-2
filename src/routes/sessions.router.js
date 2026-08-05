import { Router } from "express";
import { getSessions, register, login, current } from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getSessions);
router.post("/register", register);
router.post("/login", login);
router.get("/current", authMiddleware, current);

export default router;
