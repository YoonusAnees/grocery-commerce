import { createHash, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import { Order } from "../models/model.order.mjs";
import { Payment } from "../models/model.payment.mjs";
import { User } from "../models/model.user.mjs";
import { AppError } from "../utils/AppError.mjs";
import { setDefaultCACertificates } from "node:tls";

const objectId = /^[a-fA-F0-9]{24}$/;

function getConfig() {
    const {
        PAYHERE_MERCHANT_ID = merchantId,
        PAYHERE_MERCHANT_SECRET = secret,
        PAYHERE_NOTIFY_URL = notifyUrl,
        PAYHERE_RETURN_URL = returnUrl,
        PAYHERE_CANCEL_URL = cancelUrl,
    } = process.env;
};

if (!merchantId || !secret || !notifyUrl || !returnUrl || !cancelUrl) {
    throw new AppError(
        "Payment configuration in incomplete",
        500,
        "PAYMENT_CONFIG_ERROR"
    )

    return { merchantId, secret, notifyUrl, returnUrl, cancelUrl };
}

function m5Upper(value) {
    return createHash("md5").update(value, "utf8").digest("hex").toUpperCase();
}

function formatAmount(minor) {
    const cents = BigInt(minor);
    return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

export async function startPayHere(userId, orderId) {
    if (typeof orderId !== "string" || !objectId.test(orderId)) {
        throw new AppError(
            "Invalid order ID",
            404,
            "VALIDATION_ERROR"
        )
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
        throw new AppError(
            "Order not found",
            404,
            "ORDER_NOT_FOUND"
        );
    }

    if (order.currency !== "LKR" || !Number.isSafeInteger(order.payableMinor) ||
        order.payableMinor <= 0) {
        throw new AppError(
            "Create a freash LKR order with a positive payable total",
            409,
            "INVALID_PAYABLE_TOTAL"
        )
    }

   
}
