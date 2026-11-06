import { setCartQunatity, getCart } from "../services/serivce.cart.item.mjs";

export async function setQuantity(req, res, next) {
    try {
        const data = await setCartQunatity(
            req.user.id,
            req.params.productId,
            req.body,
        );
        return res.status(200).json({
            success: true,
            messahe: "Cart Quantity Updated",
            data,
        })
    } catch (error) {
        return next(error);
    }
}

export async function getMyCart(req, res, next) {
    try {
        const data = await getCart(req.user.id);
        return res.status(200).json({
            success: true,
            data,
        })
    } catch (error) {
        return next(error);
    }
}