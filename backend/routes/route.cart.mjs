import { Router } from "express";
import { setQuantity, getMyCart } from "../controllers/controller.cart.mjs";
import { protect } from "../middlewares/middleware.mjs";

const router = Router();

router.use(protect);

router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

router.get("/", getMyCart);
router.put("/items/:productId", setQuantity);

export default router;