import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },

    descriptoin: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "No Description Given"

    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true

    },

    priceMinor: {
        type: Number,
        required: true,
        min: 0,
        validate: Number.isInteger,
        message: "Price must be an integer",
        default: 0
    },

    currency: {
        type: String,
        enum: ["NGN", "USD", "GBP", "EUR", "JPY", "CAD", "LKR"],
        required: true,
        default: "LKR"
    },

    stock: {
        type: Number,
        required: true,
        min: 0,
        validate: Number.isInteger,
        message: "Stock must be an integer",
        default: 0
    },

    image:{
        publicId:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true
        }
    }


}, { timestamps: true })


export const Product = mongoose.model("Product", productSchema)