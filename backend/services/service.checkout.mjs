import mongoose from "mongoose";
import { checkoutSchema } from "../validations/validation.checkout.mjs";
import { Address } from "../models/model.address.mjs";
import { CartItem } from "../models/model.cart.item.mjs";
import { Order } from "../models/model.order.mjs";
import { Product } from "../models/model.product.mjs";
import { StockMovement } from "../models/model.stockMovement.mjs";
import { AppError } from "../utils/AppError.mjs";

function orderResponse(order, reused) {
    return {
        reused,
        order: {
            id: order.id,
            status: order.status,
            currency: order.currency,
            subtotalMinor: order.subtotalMinor,
            reservationExpiresAt: order.reservationExpiresAt,
            items: order.items,
            deliveryAddress: order.deliveryAddress,
        },
    };
}

function replayOrder(order, data) {
    if (
        !order.addressId.equals(data.addressId) ||
        order.subtotalMinor !== data.expectedSubtotalMinor
    ) {
        throw new AppError(
            "This Checkout key was already used with different details",
            409,
            "CHECKOUT_KEY_CONFLICT"
        );
    }

    return orderResponse(order, true);
}

export async function checkout(userId, body) {
    const valiData = checkoutSchema.safeParse(body);

    if (!valiData.success) {
        throw new AppError(
            valiData.error.issues[0].message,
            400,
            "VALIDATION_ERROR"
        );
    }
    const data = valiData.data;
    console.log(data);

    const orderFilter = { user: userId, checkoutKey: data.checkoutKey };

    try {

        return await mongoose.connection.transaction(async (session) => {
            const existing = await Order.findOne(orderFilter).session(session);
            if (existing) return replayOrder(existing, data);
            const address = await Address.findOne({
                _id: data.addressId,
                user: userId
            })
                .select("fullName phone line1 line2 city region postalCode country -_id")
                .session(session)
                .lean();

            if (!address) {
                throw new AppError(
                    "Address not found",
                    404,
                    "ADDRESS_NOT_FOUND"
                );
            }

            const cart = await CartItem.find({ user: userId })
                .sort({ product: 1 })
                .session(session)
                .lean();

            if (cart.length === 0) {
                throw new AppError(
                    "Youe cart is empty",
                    409,
                    "CART_EMPTY"
                );
            }

            let currency;
            let subtotalMinor = 0;
            const items = [];
            const movements = [];

            for (const entry of cart) {
                const product = await Product.findOneAndUpdate({
                    _id: entry.product,
                    isActive: true,
                    stock: { $gte: entry.quantity },
                }, { $inc: { stock: -entry.quantity } },
                    { returnDocument: 'after', session },);

                if (!product) {
                    throw new AppError(
                        "An items is unavailable or has insufficient stock",
                        409,
                        "ITEM_UNAVAILABLE"
                    );
                }
                if (currency && currency !== product.currency) {
                    throw new AppError(
                        "Checkout requires items in one currency",
                        409,
                        "MIXED_CURRENCIES"
                    );
                }

                currency = product.currency;
                subtotalMinor += product.priceMinor * entry.quantity;

                if (!Number.isSafeInteger(subtotalMinor)) {
                    throw new AppError(
                        "Cart amount exceeds the supported limits",
                        409,
                        "CART_AMOUNT_TOO_LARGE"
                    );
                }

                items.push({
                    product: product._id,
                    name: product.name,
                    quantity: entry.quantity,
                    priceMinor: product.priceMinor,
                });

                movements.push({
                    product: product._id,
                    changeBy: userId,
                    change: -entry.quantity,
                    before: product.stock + entry.quantity,
                    after: product.stock,
                    reason: "Checkout stock reservation",
                });
            }

            if (subtotalMinor !== data.expectedSubtotalMinor) {
                throw new AppError(
                    "Your cart subtotal chnaged. Review your cart and try again",
                    409,
                    "CART_TOTAL_CHANGED",
                );
            }

            const [order] = await Order.create([{
                ...orderFilter,
                addressId: data.addressId,
                deliveryAddress: address,
                items,
                currency,
                subtotalMinor,
                reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            }],
                { session });

            await StockMovement.insertMany(movements, { session });

            await CartItem.deleteMany(
                { user: userId, _id: { $in: cart.map((entry) => entry._id) } },
                { session },
            );
            return orderResponse(order, false);
        })

    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.checkoutKey) {
            const existing = await Order.findOne(orderFilter);
            if (existing) return replayOrder(existing, data);
        }

        throw error;
    }
}