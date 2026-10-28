import multer from "multer";
import { AppError } from "../utils/AppError.mjs";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 0,
        parts: 1
    }
}).single("image");

export function uploadImage(req, res, next) {
    upload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            const tooLarge = error.code === "LIMIT_FILE_SIZE";

            return next(
                new AppError(
                    tooLarge ? "Image must be smaller than 5MB" :
                        "Send exactly 1 file",
                    tooLarge ? 413 : 400,
                    tooLarge ? "LIMIT_FILE_SIZE" : "LIMIT_UNEXPECTED_FILE"
                ),
            );
        }

        return next(error);

    });

    

}