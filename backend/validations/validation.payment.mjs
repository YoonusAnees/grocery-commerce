import { z } from "zod";

export const notificationSchema = z.object({
  merchant_id: z.string().min(1).max(50),
  order_id: z.string().regex(objectId),
  payment_id: z.string().min(1).max(100),
  payhere_amount: z.string().regex(/^\d{1,14}(?:\.\d{1,2})?$/),
  payhere_currency: z.string().regex(/^[A-Z]{3}$/),
  status_code: z.enum(["2", "0", "-1", "-2", "-3"]),
  md5sig: z.string().regex(/^[a-fA-F0-9]{32}$/),
});