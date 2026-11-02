import { NextResponse } from "next/server";

export class ApiError extends Error {
    constructor(message, status, code) {
        super(message);

        this.status = status;
        this.code = code;
    }
}

export function json(data, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
}

export function handleError(error) {
    if (error instanceof ApiError) {
        return json(
            {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                },
            },
            error.status,
        );
    }

    // Avoid logging request bodies, cookies, or tokens.
    console.error("Unexpected BFF error:", error.name);

    return json(
        {
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong",
            },
        },
        500,
    );
}

export function requireOrigin(request) {
    const origin = process.env.APP_ORIGIN;

    if (!origin) {
        throw new ApiError(
            "Application origin is not configured",
            500,
            "CONFIGURATION_ERROR",
        );
    }

    if (request.headers.get("origin") !== origin) {
        throw new ApiError(
            "Request origin is not allowed",
            403,
            "FORBIDDEN_ORIGIN",
        );
    }
}

export function getAccessToken(request) {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
        throw new ApiError(
            "Authentication required",
            401,
            "AUTHENTICATION_REQUIRED",
        );
    }

    return token;
}

export async function backendRequest(path, options = {}) {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        throw new ApiError(
            "Backend is not configured",
            500,
            "CONFIGURATION_ERROR",
        );
    }

    let response;

    try {
        response = await fetch(`${backendUrl}${path}`, {
            ...options,
            cache: "no-store",
            signal: AbortSignal.timeout(40_000),
        });
    } catch {
        throw new ApiError(
            "Backend is temporarily unavailable",
            503,
            "BACKEND_UNAVAILABLE",
        );
    }

    let result;

    try {
        result = await response.json();
    } catch {
        throw new ApiError(
            "Backend returned an invalid response",
            502,
            "INVALID_BACKEND_RESPONSE",
        );
    }

    if (!response.ok) {
        if (
            response.status >= 400 &&
            response.status < 500 &&
            typeof result?.error?.message === "string" &&
            typeof result?.error?.code === "string"
        ) {
            throw new ApiError(
                result.error.message,
                response.status,
                result.error.code,
            );
        }

        throw new ApiError(
            "Backend could not complete the request",
            502,
            "BACKEND_ERROR",
        );
    }

    if (result?.success !== true || result.data == null) {
        throw new ApiError(
            "Backend returned incomplete data",
            502,
            "INVALID_BACKEND_RESPONSE",
        );
    }

    return result;
}