import "dotenv/config";
import jwt from "jsonwebtoken";

const secret = process.env.JWT;

if (!secret || secret.length <= 0) {
    throw new Error("JWT_SECRET must contain at least 64 characters");
};

const options = {
    algorithm: "HS256",
    issuer: "grocery-api",
    audience: "grocery-bff",
};

export function createAccessToken(userID,sessionID) {
    return jwt.sign({sid:sessionID}, secret, {
        ...options,
        subject: userID,
        expiresIn: "15m"
    });
}


export function verifyAccessToken(token) {
    return jwt.verify(token, secret, {
        algorithms: [options.algorithm],
        issuer: options.issuer,
        audience: options.audience,
    });
}