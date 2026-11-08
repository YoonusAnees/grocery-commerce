import mongoose  from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25
    },
    line1: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },

    line2: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
    },

    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },

    region: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },

    postalCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
    },

    country: {
        type: String,
        required: true,
        enum: ["AU", "LK"],
    },
}, { timestamps: true },

)

export const Address = mongoose.model("Address", addressSchema);