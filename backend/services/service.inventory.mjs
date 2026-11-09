import mongoose from "mongoose";
import { Product } from "../models/model.product.mjs";
import { StockMovement } from "../models/model.stockMovement.mjs";
import { AppError } from "../utils/AppError.mjs";
import { adjustmentSchema } from "../validations/validation.inventory.mjs";

function validateProductId(id) {
    if (
        typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)
    ) {
        throw new AppError(
            "Invalid Product ID",
            400,
            "VALIDATION_ERROR"
        )
    };
}

function toMovementResponse(movement) {
    return {
        id: movement.id,
        product: String(movement.product),
        changeBy: String(movement.changeBy),
        change: movement.change,
        before: movement.before,
        after: movement.after,
        reason: movement.reason,
        createdAt: movement.createdAt
    }
}

export async function adjustStock(productId, userId, data) {
    validateProductId(productId);
    const validData = adjustmentSchema.safeParse(data);

    if (!validData.success) {
        throw new AppError(
            validData.error.issues[0].message,
            400,
            "VALIDATION_ERROR",
        );
    }

    const { change, reason } = validData.data;

    return mongoose.connection.transaction(async (session) => {
        const product = await Product.findById(productId)
            .session(session);

        if (!product) {
            throw new AppError(
                "Product not found",
                404,
                "PRODUCT_NOT_FOUND"
            )
        }

        const before = product.stock;
        const after = before + change;

        if (!Number.isSafeInteger(after) || after < 0) {
            throw new AppError(
                "Adjustment would produce an invalid stock quantity",
                409,
                "INVALID_STOCK_ADJUSTMENT"
            );
        }

        product.stock = after;

        await product.save({ session });

        const [movement] = await StockMovement.create(
            [
                {
                    product: productId,
                    changeBy: userId,
                    change,
                    before,
                    after,
                    reason
                },
            ],
            { session },
        );

        return toMovementResponse(movement);
    });

}

export async function getStockHistory(productId) {
    validateProductId(productId);

    const exists = await Product.exists({ _id: productId });

    if (!exists) {
        throw new AppError(
            "Product not found",
            404,
            "PRODUCT_NOT_FOUND"
        );
    }

    const movements = await StockMovement.find({
        product: productId
    })
        .sort({ createdAt: -1, _id: -1 })
        .limit(50);

    return movements.map(toMovementResponse);
}