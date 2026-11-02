import bcrypt from "bcryptjs";

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

    if (
        !["jpg", "jpeg", "png", "webp"].includes(uploadedImage.format) ||
        typeof uploadedImage.secure_url !== "string" ||
        !uploadedImage.secure_url.startsWith("https://")
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

