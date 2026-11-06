import { z } from "zod";

export const quantitySchema = z.object({
    quantity: z.number().int().min(1).max(100),
}).strict();