import "dotenv/config";
import app from "./app.mjs";
import { connectDatabase } from "./config/database.mjs";
import { expirePendingOrders } from "./services/service.order.mjs";


let expiryRunning = false;

async function runExpiry() {
    if (expiryRunning) return;
    expiryRunning = true;

    try {
        await expirePendingOrders();
    } catch (error) {
        console.error("Order expiry check failed:", error.message);
    } finally {
        expiryRunning = false;
    }
}



async function startServer() {
    try {
        await connectDatabase();

        const port = Number(process.env.PORT || 5000);
        const host = "0.0.0.0";

        const server = app.listen(port, host, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log(`Local network access: http://YOUR_LOCAL_IP:${port}`);

        });

        server.on("error", (error) => {
            console.error("Server failed:", error.message);
            process.exit(1);
        });

        void runExpiry();
        const expiryTimer = setInterval(() => void runExpiry(), 30_000);
        expiryTimer.unref();

    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}

startServer();