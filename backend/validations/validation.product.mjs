import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string()
        .trim()
        .min(3, "Name must be atleast 3 characters")
        .max(100, "Name cannot be greater than 100 characters")
        .default("Untitled"),

    description: z.string()
        .trim()
        .max(1000, "Description cannot be greater than 1000 characters")
        .default("No description"),

    category: z
        .string()
        .refine((value) => mongoose.isObjectIdOrHexString(value),
            "Invalid Category ID"
        ),

    priceMinor: z.number()
        .int("Price must be integer")
        .positive("Price must be positive")
        .min(0)
        .max(Number.MAX_SAFE_INTEGER),

    currency: z
        .enum(["NGN", "USD", "GBP", "EUR", "JPY", "CAD", "LKR"])
        .default("LKR"),

    stock: z
        .number()
        .int("Stock must be integer")
        .positive("Stock must be positive")
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .default(0),

    imagePublicId: z.
        string()
        .max(255)
        .regex(/^grocery\/products\/[a-zA-Z0-9_-]+$/,
            "Invalid image public ID"
        ),


}).strict();


export const listProductsSchema = z.object({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
}).strict();