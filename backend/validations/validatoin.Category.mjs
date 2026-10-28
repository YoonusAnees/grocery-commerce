import { z } from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Category name must contain at least 2 Characters")
        .max(80, "Category name cannot exceed 80 characters"),
}).strict();

