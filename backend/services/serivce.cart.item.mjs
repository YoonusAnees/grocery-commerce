import { quantitySchema } from "../validations/validation.cart.item.mjs";
import { AppError } from "../utils/AppError.mjs";
import { CartItem } from "../models/model.cart.item.mjs";
import { Product } from "../models/model.product.mjs";
import mongoose from "mongoose";


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
            validData.error.issues[0].message,
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
        const item = await CartItem.findOneAndUpdate(
            filter,
            { $set: { quantity } },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            },
        );

        return {
            productId,
            quantity: item.quantity
        };

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
                returnDocument: "after",
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
    const cartItems = await CartItem.find({ user: userId })
        .sort({ createdAt: 1, _id: 1 })
        .lean();

    
    const productIds = cartItems.map((item) => item.product);

    const products = await Product.find({
        _id: { $in: productIds },
    }).lean();

    const productMap = new Map(
        products.map((p) => [String(p._id), p])
    );

    const totals = new Map();

    const items = cartItems.map((item) => {
        const productId = String(item.product);
        const product = productMap.get(productId);

        if (!product || !product.isActive) {
            return {
                productId,
                name: product?.name ?? "Unavailable Product",
                imageUrl: product?.uploadedImage?.url ?? null,
                quantity: item.quantity,
                priceMinor: product?.priceMinor ?? 0,
                currency: product?.currency ?? "LKR",
                subtotalMinor: 0,
                availableStock: 0,
                available: false,
                issue: "PRODUCT_UNAVAILABLE",
            };
        }

        const subtotalMinor = product.priceMinor * item.quantity;
        const currentTotal = totals.get(product.currency) ?? 0;
        const nextTotal = currentTotal + subtotalMinor;

        if (!Number.isSafeInteger(subtotalMinor) || !Number.isSafeInteger(nextTotal)) {
            throw new AppError(
                "Cart amount exceeds the supported limits",
                409,
                "CART_AMOUNT_TOO_LARGE"
            );
        }

        totals.set(product.currency, nextTotal);
        const available = item.quantity <= product.stock;

        return {
            productId,
            name: product.name,
            imageUrl: product.uploadedImage?.url ?? null, // 2. Fixed: points to uploadedImage.url
            quantity: item.quantity,
            priceMinor: product.priceMinor,
            currency: product.currency,
            subtotalMinor,
            availableStock: product.stock,
            available,
            issue: available ? null : "INSUFFICIENT_STOCK",
        };
    });

    return {
        items,
        totalsByCurrency: [...totals].map(([currency, subtotalMinor]) => ({
            currency,
            subtotalMinor,
        })),
        canCheckout:
            items.length > 0 &&
            items.every((item) => item.available) &&
            totals.size === 1,
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

    await CartItem.deleteOne({
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