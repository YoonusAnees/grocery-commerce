import { z } from "zod";


export const checkoutSchema = z.object({
    addressId: z.string().regex(/^[a-fA-F0-9]{24}$/),
    checkoutKey: z.string().uuid(),
    expectedSubtotalMinor: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
}).strict();