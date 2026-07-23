import { Router } from "express";
import { session } from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", session);

export default router;