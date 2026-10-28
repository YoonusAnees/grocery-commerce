import { Router } from "express";
import { createProducts, getAllProducts, updateProduct, deleteProduct } from "../controllers/controller.product.mjs";
import { protect } from "../middlewares/middleware.mjs";
import { authorize } from "../middlewares/authorize.mjs";

const router = Router();

router.post("/", protect, authorize("admin"), createProducts);
router.get("/", getAllProducts);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;