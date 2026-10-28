import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    namekey: {
        type: String,
        required: true,
        unique: true,
        select: false
    }

}, {
    timestamps: true
})

export const Category = mongoose.model("Category", categorySchema)