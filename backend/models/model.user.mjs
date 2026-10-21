import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: [
            "customer", "admin"
        ],
        default: "customer"
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);