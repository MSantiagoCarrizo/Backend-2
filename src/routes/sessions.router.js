import { Router } from "express";
import { getSessions, register, login } from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", getSessions);
router.post("/register", register);
router.post("/login", login);

export default router;
