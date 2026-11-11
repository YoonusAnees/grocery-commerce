import mongoose from "mongoose";
const id = mongoose.Types.ObjectId;
const paymentSchema = new mongoose.Schema({
    order: {
        type: id,
        ref: "Order",
        requierd: true,
    },

    providerPaymentId: {
        type: String,
        requierd: true,
        unique: true,
    },
    amountMinor: {
        type: Number,
        requierd: true
    },
    currency: {
        type: String,
        requierd: true
    },
    disposition: {
        type: String,
        enum: ["applied", "refund_requierd"],
        requierd: true,
    },
    reviewReason: {
        type: String,
        default: null,
    }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);