import { mongoose } from "mongoose"
const id = mongoose.Schema.Types.ObjectId;
const cartItemSchema = new mongoose.Schema({


    user: {
        type: id,
        ref: "User",
        required: true,
    },

    product: {
        type: id,
        ref: "Product",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
        validate: Number.isInteger
    }

}, { timestamps: true });


cartItemSchema.index({
    user: 1, product: 1
}, { unique: true });


export const CartItem = mongoose.model("CartItem", cartItemSchema);