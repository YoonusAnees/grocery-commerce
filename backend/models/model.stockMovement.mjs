import { mongoose } from "mongoose";
const id = mongoose.Schema.Types.ObjectId;
const stockMovementSchema = new mongoose.Schema({

    product: {
        type: id,
        ref: "Product",
        required: true,
    },
    changeBy: {
        type: id,
        ref: "User",
        required: true
    },
    change: {
        type: Number,
        required: true,
        validate: Number.isSafeInteger,
    },
    before: {
        type: Number,
        required: true,
        min: 0
    },
    after: {
        type: Number,
        required: true,
        min: 0
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
}, { timestamps: true });

stockMovementSchema.index({
    product: 1,
    createdAt: -1,
    _id: -1
});

export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);