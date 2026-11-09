import mongoose from "mongoose";
import { Order } from "../models/model.order.mjs";
import { Product } from "../models/model.product.mjs";
import { StockMovement } from "../models/model.stockMovement.mjs";
import { AppError } from "../utils/AppError.mjs";

async function releaseReservation(filter, status, actorId) {
    return mongoose.connection.transaction(async (session) => {
        const order = await Order.findOneAndUpdate(
            { ...filter, status: "pending_payment" },
            { $set: { status } },
            { returnDocument: 'after', session },
        );
        if (!order) return null;
        const movements = [];

        for (const item of order.items) {
            const product = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { returnDocument: 'after', session }
            );

            if (!product) {
                throw new AppError(
                    "Reserved product is missing; stock release rolled back",
                    500,
                    "RESERVED_PRODUCT_MISSING"
                );
            }
            movements.push({
                product: product.id,
                changeBy: actorId ?? order.user,
                change: item.quantity,
                before: product.stock - item.quantity,
                after: product.stock,
                reason:
                    status === "expired"
                        ? `System: reservation expired for order ${order.id}`
                        : `Customer cancelled order ${order.id}`,
            });
        }

        await StockMovement.insertMany(movements, { session });

        return { id: order.id, status: order.status };
    });
}

export async function cancelMyOrder(userId, orderId) {
    if (typeof orderId !== "string" || !mongoose.isObjectIdOrHexString(orderId)) {
        throw new AppError(
            "Invalid order ID",
            400,
            "VALIDATION_ERROR"
        )
    }

    const filter = { _id: orderId, user: userId };
    const cancelled = await releaseReservation(filter, "cancelled", userId);
    if (cancelled) return cancelled;
    const existing = await Order.findOne(filter).select("status");

    if (!existing) {
        throw new AppError(
            "Order not found",
            404,
            "ORDER_NOT_FOUND"
        );
    }

    if (existing.status === "cancelled") {
        return { id: existing.id, status: existing.status };
    }
    throw new AppError(
        "This order can no longer be cancelled",
        409,
        "ORDER_NOT_CANCELLABLE"
    );
}

export async function expirePendingOrders() {
    const cutoff = new Date();
    const overdue = await Order.find({
        status: "pending_payment",
        reservationExpiresAt: { $lte: cutoff },
    })
        .sort({ reservationExpiresAt: 1 })
        .select("_id")
        .limit(50)
        .lean();

    for (const order of overdue) {
        try {
            await releaseReservation({
                _id: order._id,
                reservationExpiresAt: { $lte: cutoff },
            },
                "expired",
            );
        } catch (error) {
            console.error(
                "Could not expire order",
                String(order._id),
                error.message,
            );
        }
    }
}