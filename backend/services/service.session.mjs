import { createHash, randomBytes } from "node:crypto";

import { Session } from "../models/model.session.mjs";
import { AppError } from "../utils/AppError.mjs";
import { createAccessToken } from "../utils/token.mjs";

function generateRefreshToken() {
    return randomBytes(64).toString("hex");
}

function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

function readRefreshToken(input) {
    const token = input?.refreshToken;

    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{128}$/.test(token)
    ) {
        throw new AppError(
            "A valid refresh token is required",
            400,
            "VALIDATION_ERROR",
        );
    }

    return token;
}

export async function createSession(userId) {
    const refreshToken = generateRefreshToken();

    const session = new Session({
        user: userId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const accessToken = createAccessToken(
        String(userId),
        session.id,
    );

    await session.save();

    return {
        accessToken,
        refreshToken,
    };
}

export async function refreshSession(input) {
    const currentToken = readRefreshToken(input);
    const nextToken = generateRefreshToken();

    const session = await Session.findOneAndUpdate(
        {
            refreshTokenHash: hashToken(currentToken),
            expiresAt: { $gt: new Date() },
        },
        {
            $set: {
                refreshTokenHash: hashToken(nextToken),
            },
        },
        { new: true },
    );

    if (!session) {
        throw new AppError(
            "Session is invalid or expired. Please log in again.",
            401,
            "INVALID_SESSION",
        );
    }

    return {
        accessToken: createAccessToken(
            String(session.user),
            session.id,
        ),
        refreshToken: nextToken,
    };
}

export async function logoutSession(input) {
    const refreshToken = readRefreshToken(input);

    await Session.deleteOne({
        refreshTokenHash: hashToken(refreshToken),
    });
}