import pino from "pino";
import { env } from "../config/env.mjs";

export const logger = pino({
    level: env.LOG_LEVEL,

    base: {
        service: "grocery-api",
        environment: env.NODE_ENV,
    },

    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers['set-cookie']",
        ],
        censor: "[REDACTED]",
    },
});