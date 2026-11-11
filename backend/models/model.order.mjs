import mongoose from "mongoose";
const id = mongoose.Schema.Types.ObjectId;
const orderItemSchema = new mongoose.Schema({
    product: {
        type: id,
        ref: "Product",
        required: true,

    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { _id: false });


const deliveryAddressSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    region: String,
    postalCode: String,
    country: String
}, { _id: false });


const orderSchema = new mongoose.Schema({
    user: {
        type: id,
        ref: "User",
        required: true
    },
    checkoutKey: {
        type: String,
        required: true,
    },
    addressId: {
        type: id,
        ref: "Address",
        required: true
    },
    deliveryAddress: {
        type: deliveryAddressSchema,
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true
    },
    currency: {
        type: String,
        enum: ["AUD", "LKR"],
        required: true
    },
    subtotalMinor: {
        type: Number,
        required: true
    },
    payableMinor: {
        type: Number,
        min: 0,
        validate: Number.isSafeInteger,
    },
    status: {
        type: String,
        enum: ["pending_payment", "paid", "cancelled", "expired"],
        default: "pending_payment",
        required: true,
    },
    reservationExpiresAt: {
        type: Date,
        required: true
    },
}, { timestamps: true });

orderSchema.index({
    user: 1,
    checkoutKey: 1,
    status: 1,
    reservationExpiresAt: 1
}, {
    unique: true
});

export const Order = mongoose.model("Order", orderSchema);