import { refine, z } from "zod";

export const registerSchema = z.object(
    {
        username: z.string().trim().min(2).max(100),
        email: z.string().trim().toLowerCase().email().max(254),
        password: z.string().min(12, "Password must contain at least 12 characters").refine((data) => {
            return Buffer.byteLength(data, "utf-8") <= 72;
        }, "Password must not exceed 72 bytes"),
    }
).strict();

export const loginSchema = z.object(
    {
        email: z.string().trim().toLowerCase().email().max(254),
        password: z.string().min(12, "Password must contain at least 12 characters").refine((data) => {
            return Buffer.byteLength(data, "utf-8") <= 72;
        }, "Password must not exceed 72 bytes")
    }
).strict();

