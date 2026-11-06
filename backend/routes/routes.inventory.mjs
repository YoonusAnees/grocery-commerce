import { Router } from "express";
import { adjust, history } from "../controllers/controller.invontery.mjs";
import { protect } from "../middlewares/middleware.mjs";
import { authorize } from "../middlewares/authorize.mjs";

const router = Router();

router.use(protect, authorize("admin"))

router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

router.post("/:productId/adjustments", adjust);
router.get("/:productId/adjustments", history)


export default router;