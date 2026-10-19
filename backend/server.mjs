import "dotenv/config";
import app from "./app.mjs";
import { connectDatabase } from "./config/database.mjs";

async function startServer() {
    try {
        await connectDatabase();

        const port = Number(process.env.PORT || 5000);

        const server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

        server.on("error", (error) => {
            console.error("Server failed:", error.message);
            process.exit(1);
        });
    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}

startServer();