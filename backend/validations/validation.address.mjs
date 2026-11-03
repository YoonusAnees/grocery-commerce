import { z } from "zod";

export const addressSchema = z.object({
    fullName: z.string().trim().min(2).max(100),

    phone: z.string().trim().max(25).refine(
        (value) => {
            const digits = value.replace(/\D/g, "");

            return (
                /^[+0-9() -]+$/.test(value) &&
                digits.length >= 7 &&
                digits.length <= 15
            );
        },
        "Provide a valid phone number",
    ),

    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).default(""),

    city: z.string().trim().min(1).max(100),
    region: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),

    country: z.enum(["AU", "LK"]),
}).strict();