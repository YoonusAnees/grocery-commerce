import { checkout } from "../services/service.checkout.mjs";

export async function createCheckout(req, res, next) {
    try {
        const { reused, order } = await checkout(req.user.id, req.body);
        return res.status(reused ? 200 : 201).json({
            success: true,
            data: order
        })
    } catch (error) {
        return next(error);
    }
};