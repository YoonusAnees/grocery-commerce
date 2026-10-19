import express from "express";

const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Grocery API is running",
    });
});

// Feature routes will go here.

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const status = error.status || 500;

    if (status >= 500) {
        console.error(error);
    }

    res.status(status).json({
        success: false,
        message:
            status >= 500 ? "Internal server error" : error.message,
    });
});

export default app;