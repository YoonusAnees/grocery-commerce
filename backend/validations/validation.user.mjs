import { z } from "zod";

export const updateProfileSchema = z.object({
    username: z.string().trim().min(2).max(100).optional(),

    phone: z
        .string()
        .trim()
        .max(25)
        .refine(
            (value) =>
                value === "" ||
                (
                    /^[+0-9() -]+$/.test(value) &&
                    value.replace(/\D/g, "").length >= 7 &&
                    value.replace(/\D/g, "").length <= 15
                ),
            "Provide a valid phone number",
        )
        .optional(),
}).strict().refine(
    (data) => Object.values(data).some(
        (value) => value !== undefined,
    ),
    "Provide at least one field to update",
);