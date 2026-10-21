import express from "express";
import { errorHandler } from "./middlewares/errorHandler.mjs";
import authRoutes from "./routes/auth.routes.mjs"

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
app.use(errorHandler);


export default app;