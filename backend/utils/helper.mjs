import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { AppError } from "./AppError.mjs";
const saltRounds = 10;

export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
};

export const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};


export const verifyProductImage = async (publicId) => {
    let uploadedImage;

    try {
        uploadedImage = await cloudinary.api.resource(publicId, {
            resource_type: "image",
            type: "upload",
        });
    } catch (error) {
        console.error("Cloudinary resource lookup error:", error);

        if (
            error.http_code === 404 ||
            error.error?.http_code === 404
        ) {
            throw new AppError(
                "Uploaded image not found",
                400,
                "IMAGE_NOT_FOUND",
            );
        }

        throw new AppError(
            "Could not verify the image. Please try again.",
            502,
            "IMAGE_VERIFICATION_FAILED",
        );
    }

    const allowedFormats = ["jpg", "jpeg", "png", "webp"];

    if (
        !allowedFormats.includes(uploadedImage?.format) ||
        typeof uploadedImage?.secure_url !== "string" ||
        !uploadedImage?.secure_url.startsWith("https://")
    ) {
        throw new AppError(
            "The uploaded image is not supported",
            400,
            "INVALID_IMAGE",
        );
    }

    return {
        publicId: uploadedImage.public_id,
        url: uploadedImage.secure_url,
    };
};

