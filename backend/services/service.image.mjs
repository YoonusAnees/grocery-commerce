import { fileTypeFromBuffer } from "file-type";

import cloudinary from "../config/cloudinary.mjs";
import { AppError } from "../utils/AppError.mjs";

export async function uploadProductImage(file) {
    if (!file) {
        throw new AppError(
            "Please select an image",
            400,
            "IMAGE_REQUIRED",
        );
    }

    const type = await fileTypeFromBuffer(file.buffer);

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!type || !allowedTypes.includes(type.mime)) {
        throw new AppError(
            "Only JPEG, PNG, and WebP images are allowed",
            400,
            "INVALID_IMAGE_TYPE",
        );
    }

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                folder: "grocery/products",
                allowed_formats: ["jpg", "jpeg", "png", "webp"],
                timeout: 30_000,
            },
            (error, uploaded) => {
                if (error || !uploaded) {
                    reject(
                        new AppError(
                            "Image upload failed. Please try again.",
                            502,
                            "IMAGE_UPLOAD_FAILED",
                        ),
                    );

                    return;
                }

                resolve(uploaded);
            },
        );

        stream.on("error", () => {
            reject(
                new AppError(
                    "Image upload failed. Please try again.",
                    502,
                    "IMAGE_UPLOAD_FAILED",
                ),
            );
        });

        stream.end(file.buffer);
    });

    return {
        publicId: result.public_id,
        url: result.secure_url,
    };
}