import express from "express";
import { errorHandler } from "./middlewares/errorHandler.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import categoryRoutes from "./routes/category.route.mjs";
import imageRoutes from "./routes/routes.image.mjs";
import productRoutes from "./routes/product.route.mjs";

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
app.use(errorHandler);


export default app;