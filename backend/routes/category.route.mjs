import { Router } from "express";
import { create, getAll } from "../controllers/controller.category.mjs";
import { protect } from "../middlewares/middleware.mjs";
import { authorize } from "../middlewares/authorize.mjs";


const router = Router();

router.get("/", getAll);
router.post("/", protect, authorize("admin"), create);


export default router;
