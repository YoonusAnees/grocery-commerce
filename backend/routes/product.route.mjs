import { Router } from "express";

import {
    create,
    getAll,
    getOne,
    update,
    getAllAdmin,
    getOneAdmin,
} from "../controllers/controller.product.mjs";

import { protect } from "../middlewares/middleware.mjs";
import { authorize } from "../middlewares/authorize.mjs";

const router = Router();

// Register specific admin paths before "/:id".
router.get(
    "/admin",
    protect,
    authorize("admin"),
    getAllAdmin,
);

router.get(
    "/admin/:id",
    protect,
    authorize("admin"),
    getOneAdmin,
);

router.get("/", getAll);
router.get("/:id", getOne);

router.post(
    "/",
    protect,
    authorize("admin"),
    create,
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    update,
);

export default router;