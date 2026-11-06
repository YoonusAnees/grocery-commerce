import { adjustStock, getStockHistory } from "../services/service.inventory.mjs";

export async function adjust(req, res, next) {

    try {
        const movement = await adjustStock(
            req.params.productId,
            req.user.id,
            req.body
        );
        return res.status(200).json({
            success: true,
            message: "Stock Adjusted successfully",
            data: movement
        })
    } catch (error) {
        return next(error);
    }
}

export async function history(req, res, next) {
    try {
        const movement = await getStockHistory(req.params.productId);
        return res.status(200).json({
            success: true,
            data: movement
        })
    } catch (error) {
        return next(error);
    }
}