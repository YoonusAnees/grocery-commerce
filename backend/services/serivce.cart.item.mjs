import { quantitySchema } from "../validations/validation.cart.item.mjs";
import { AppError } from "../utils/AppError.mjs";
import { CartItem } from "../models/model.cart.item.mjs";
import { Product } from "../models/model.product.mjs";
import { mongoose } from "mongoose";


export async function setCartQunatity(userId, productId, data) {
    if (typeof productId !== "string" || !mongoose.isObjectIdOrHexString(productId)) {
        throw new AppError(
            "Invalid product ID",
            400,
            "VALIDATION_ERROR"
        );
    }

    const validData = quantitySchema.safeParse(data);

    if (!validData.success) {
        throw new AppError(
            result.error.issues[0].message,
            400,
            "VALIDATION_ERROR"
        );
    }

    const { quantity } = validData.data;

    const product = await Product.findOne({
        _id: productId,
        isActive: true
    });

    if (!product) {
        throw new AppError(
            "Product Not Found",
            404,
            "PRODUCT_NOT_FOUND"
        );
    }

    if (quantity > product.stock) {
        throw new AppError(
            "Requestd Quantity Exceeds available stock",
            409,
            "INSUFFICIENT_STOCK"
        );
    }

    const filter = {
        user: userId,
        product: productId
    };

    try {
        await CartItem.findOneAndUpdate(
            filter,
            { $set: { quantity } },
            {
                upsert: true,
                new: true,
                runValidators: true
            },
        );

    } catch (error) {

        if (
            error.code !== 11000 ||
            !error.keyPattern?.user ||
            !error.keyPattern?.product
        ) {
            throw error;
        }

        const updated = await CartItem.findOneAndUpdate(
            filter,
            { $set: { quantity } },
            {
                new: true,
                runValidators: true
            },
        );

        if (!updated) {
            throw new AppError(
                "Cart Chnaged Please Try Again",
                409,
                "CART_CONFLICT"
            );
        }

        return {
            productId,
            quantity
        };

    }



}

export async function getCart(userId) {
    const cartItem = await CartItem.find({ user: userId })
        .sort({ createdAt: 1, _id: 1 })
        .lean();

    const products = await Product.find({
        _id: { $in: cartItem.map((item) => item.products) },
    }).lean();

    const productMap = new Map(
        products.map((product) => [
            String(product._id),
            product,
        ]),
    );

    const totals = new Map();

    const items = cartItem.map((item) => {
        const productId = String(item.product);
        const product = productMap.get(productId);

        if (!product || !product.isActive) {
            return {
                productId,
                quantity: item.quantity,
                available: false,
                issue: "PRODUCT_UNAVAILABLE",
                subtotalMinor: null
            };

        }

        const subtotalMinor = product.priceMinor * item.quantity;
        const currentTotal = totals.get(product.currency) ?? 0;
        const nextTotal = currentTotal + subtotalMinor;

        if (
            !Number.isSafeInteger(subtotalMinor) || !Number.isSafeInteger(nextTotal)) {
            throw new AppError(
                "Cart amount ecxeeds the supported limits",
                409,
                "CART_AMOUNT_TOO_LARGE"
            );
        }

        totals.set(product.currency, nextTotal);
        const available = item.quantity <= product.stock;

        return {
            productId,
            name: product.name,
            imageUrl: product.imageUrl,
            quantity: item.quantity,
            priceMinor: product.priceMinor,
            currency: product.currency,
            subtotalMinor,
            availableStock: product.stock,
            available,
            issue: available ? null : "INSUFFICIENT_STOCK"
        };

    });

    return {
        items,
        totalsByCurrency: [...totals].map(([currency, subtotalMinor]) => ({
            currency,
            subtotalMinor,
        }),
        ),

        canCheckout:
            items.length > 0 &&
            items.every((item) => item.available) && totals.size === 1,
    };
}

export async function removeCartItem(userId, productId) {
    if (
        typeof productId !== "string" || !mongoose.isObjectIdOrHexString(productId)
    ) {
        throw new AppError(
            "Invalid Product ID",
            400,
            "VALIDATION_ERROR",
        );
    }

    await CartItem.delete({
        user: userId,
        product: productId,
    });

    return { productId };
}

export async function clearCart(userId) {
    const valiDate = await CartItem.deleteMany(
        { user: userId },
    );

    return {
        removedCount: valiDate.deletedCount
    };
}