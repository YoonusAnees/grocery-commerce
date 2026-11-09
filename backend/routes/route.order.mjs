import { Router } from "express";

import { protect } from "../middlewares/middleware.mjs";
import { cancelMyOrder } from "../services/service.order.mjs";

const router = Router();

router.post("/:orderId/cancel", protect, async (req, res, next) => {
    try {
        const data = await cancelMyOrder(req.user.id, req.params.orderId);

        res.set("Cache-Control", "no-store");
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return next(error);
    }
});

export default router;