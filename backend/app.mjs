import express from "express";
import { errorHandler } from "./middlewares/errorHandler.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import categoryRoutes from "./routes/category.route.mjs";
import imageRoutes from "./routes/routes.image.mjs";
import productRoutes from "./routes/product.route.mjs";
import userRoutes from "./routes/route.user.mjs";
import addressRoutes from "./routes/route.address.mjs";
import inventoryRoutes from "./routes/routes.inventory.mjs";
import cartRoutes from "./routes/route.cart.mjs";
import checkoutRoutes from "./routes/routes.checkout.mjs";

const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Grocery API is running",
    });
});

// Feature routes will go here.

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout",checkoutRoutes)
app.use(errorHandler);


export default app;