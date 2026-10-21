import mongoose from "mongoose";

import { AppError } from "../utils/AppError.mjs";
import { User } from "../models/model.user.mjs";
import { verifyAccessToken } from "../utils/token.mjs";
import { Session } from "../models/model.session.mjs"

export const protect = async (req, res, next) => {
    try {
        const [scheme, token, extra] =
            req.headers.authorization?.trim().split(/\s+/) || [];

        if (scheme?.toLowerCase() !== "bearer" || !token || extra) {
            throw new AppError(
                "Authorization header must follow the format 'Bearer <token>'",
                401,
                "AUTHENTICATION_REQUIRED",
            );
        }

        let decoded;

        try {
            decoded = verifyAccessToken(token);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new AppError(
                    "Access token has expired",
                    401,
                    "TOKEN_EXPIRED",
                );
            }

            if (
                error.name === "JsonWebTokenError" ||
                error.name === "NotBeforeError" ||
                error instanceof SyntaxError
            ) {
                throw new AppError(
                    "Invalid access token",
                    401,
                    "INVALID_TOKEN",
                );
            }

            throw error;
        }


        // JWT's "subject" option becomes the "sub" field.
        const userId = decoded?.sub;

        if (
            typeof userId !== "string" ||
            !mongoose.isObjectIdOrHexString(userId)
        ) {
            throw new AppError(
                "Invalid token payload",
                401,
                "INVALID_TOKEN",
            );
        }

        const user = await User.findById(userId)
            .select("_id username role");

        if (!user) {
            throw new AppError(
                "Account no longer exists",
                401,
                "ACCOUNT_NOT_FOUND",
            );
        }


        const sessionID = decoded?.sid;

        if (
            typeof sessionID !== "string" ||
            !mongoose.isObjectIdOrHexString(sessionID)
        ) {
            throw new AppError(
                "Invalid token payload",
                401,
                "INVALID_TOKEN",
            );
        }

        const sessionExist = await Session.exists({
            _id: sessionID,
            user: userId,
            expiresAt: { $gt: new Date() }
        });

        if (!sessionExist) {
            throw new AppError(
                "Session has expired or you have logged out ",
                401,
                "INVALID_SESSION",
            );
        }


        req.user = user;

        return next();
    } catch (error) {
        return next(error);
    }
};