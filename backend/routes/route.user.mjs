import { Router } from "express";

import {
    getProfile,
    updateProfile,
} from "../controllers/controller.user.mjs";

import { protect } from "../middlewares/middleware.mjs";

const router = Router();

router.use(protect);

router.get("/me", getProfile);
router.patch("/me", updateProfile);

export default router;