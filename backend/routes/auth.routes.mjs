import { Router } from "express";
import { register, login, profile, logout, refresh } from "../controllers/controller.auth.mjs";
import { protect } from "../middlewares/middleware.mjs";
import { authorize } from "../middlewares/authorize.mjs";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/admin-check", protect, authorize("admin"), (req, res) => {
    res.set("Cache-Control", "no-store");
    return res.status(200).json({
        success: true,
        message: "Admin access granted",
    });
},
);

export default router;