import { setCartQunatity, getCart, removeCartItem, clearCart } from "../services/serivce.cart.item.mjs";

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

export async function remove(req, res, next) {
    try {
        const data = await removeCartItem(req.user.id, req, params.productId);
        return res.status(200).json({
            success: true,
            message: "Item Removed From Cart",
            data,
        })
    } catch (error) {
        return next(error);
    }
}

export async function clear(req, res, next) {
    try {
        const data = await clearCart(req.user.id);
        return res.status(200).json({
            success: true,
            message: "Cart Cleared",
            data
        })
    } catch (error) {
        return next(error);
    }
}