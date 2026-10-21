import { AppError } from "../utils/AppError.mjs";

export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    let status = 500;
    let code = "INTERNAL_ERROR";
    let message = "Something went wrong. Please try again.";

    if (error instanceof AppError) {
        status = error.status;
        code = error.code;
        message = error.message;
    } else if (error.type === "entity.parse.failed") {
        status = 400;
        code = "INVALID_JSON";
        message = "Request body must contain valid JSON";
    } else if (error.type === "entity.too.large") {
        status = 413;
        code = "PAYLOAD_TOO_LARGE";
        message = "Request body is too large";
    } else if (error.code === 11000) {
        status = 409;
        code = "DUPLICATE_RECORD";
        message = "A record with these details already exists";
        console.error("Duplicate field:", error.keyPattern);
    } else if (
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status < 500
    ) {
        // Supports the expected errors from our existing registration code.
        status = error.status;
        code = "REQUEST_ERROR";
        message = error.message;
    }

    if (status >= 500) {
        console.error(error);
    }

    return res.status(status).json({
        success: false,
        error: {
            code,
            message,
        },
    });
}