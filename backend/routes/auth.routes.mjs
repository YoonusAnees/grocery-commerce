import { Router } from "express";
import { register, login, profile, logout, refresh } from "../controllers/controller.auth.mjs";
import { protect } from "../middlewares/middleware.mjs";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;