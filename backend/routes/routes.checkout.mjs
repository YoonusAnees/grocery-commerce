import { Router } from "express";
import { createCheckout } from "../controllers/controller.checkout.mjs";
import { protect } from "../middlewares/middleware.mjs";

const router = Router();

router.post(
    "/",
    protect, // 1. Reads req.headers.authorization and attaches req.user
    (req, res, next) => { // 2. Modifies res headers and passes req along
        res.set("Cache-Control", "no-store");
        next();
    },
    createCheckout // 3. Reads req.user.id and req.body to call checkout()
);

export default router;