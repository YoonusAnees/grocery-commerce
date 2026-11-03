import { Router } from "Exporess"
import { create, getAll, update, deleteAddress } from "../controllers/controller.address.mjs"
import { protect } from "../middlewares/middleware.mjs";
const router = Router();

router.use(protect);

router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteAddress);

export default router;