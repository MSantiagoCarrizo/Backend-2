import { Router } from "express";
import { getUsers } from "../controllers/users.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", auth, authorizeRoles("admin"), getUsers);

export default router;