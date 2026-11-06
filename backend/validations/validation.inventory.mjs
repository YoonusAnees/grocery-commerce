import { z } from "zod";

export const adjustmentSchema = z.object({
    change: z
        .number()
        .int()
        .min(-1_000_000)
        .max(1_000_000)
        .refine(
            (value) => value !== 0,
            "Stock change cannot be zero",
        ),

    reason: z.string().trim().min(3).max(300),
}).strict();
