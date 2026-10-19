import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(5000),

    MONGODB_URI: z
        .string()
        .trim()
        .min(1, "MONGODB_URI is required")
        .regex(
            /^mongodb(?:\+srv)?:\/\/\S+$/,
            "MONGODB_URI must be a MongoDB connection string",
        ),

    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    // Print validation messages without exposing configuration values.
    console.error("Invalid environment configuration:");

    for (const issue of result.error.issues) {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    }

    process.exit(1);
}

export const env = Object.freeze(result.data);