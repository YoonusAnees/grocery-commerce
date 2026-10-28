import {
    uploadProductImage,
} from "../services/service.image.mjs";

export async function upload(req, res, next) {
    try {
        const image = await uploadProductImage(req.file);

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            data: image,
        });
    } catch (error) {
        return next(error);
    }
}