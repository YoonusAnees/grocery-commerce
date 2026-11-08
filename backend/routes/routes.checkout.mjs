import { Router } from "express";
import { createCheckout } from "../controllers/controller.checkout.mjs";
import { protect } from "../middlewares/middleware.mjs";

const router = Router();

router.post("/", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
}, createCheckout);

export default router;