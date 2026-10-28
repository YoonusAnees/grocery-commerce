import { Router } from "express";

import { upload } from "../controllers/controller.image.mjs";
import { protect } from "../middlewares/middleware.mjs";
import { authorize } from "../middlewares/authorize.mjs";
import { uploadImage } from "../middlewares/uploadImage.mjs";

const router = Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    uploadImage,
    upload,
);

export default router;