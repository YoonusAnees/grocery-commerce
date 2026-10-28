import { NextResponse } from "next/server";

function fail(message, status, code) {
    return NextResponse.json(
        {
            success: false,
            error: { code, message },
        },
        {
            status,
            headers: { "Cache-Control": "no-store" },
        },
    );
}

export async function POST(request) {
    const backendUrl = process.env.BACKEND_URL;
    const appOrigin = process.env.APP_ORIGIN;

    if (!backendUrl || !appOrigin) {
        return fail(
            "Authentication is not configured",
            500,
            "CONFIGURATION_ERROR",
        );
    }

    // Reject login submissions from other origins.
    if (request.headers.get("origin") !== appOrigin) {
        return fail(
            "Request origin is not allowed",
            403,
            "FORBIDDEN_ORIGIN",
        );
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return fail(
            "Request body must contain valid JSON",
            400,
            "INVALID_JSON",
        );
    }

    if (
        !body ||
        typeof body.email !== "string" ||
        typeof body.password !== "string" ||
        body.email.length > 254 ||
        body.password.length > 1024
    ) {
        return fail(
            "Email and password are required and must be valid strings",
            400,
            "VALIDATION_ERROR",
        );
    }

    let upstream;

    try {
        upstream = await fetch(
            `${backendUrl}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: body.email,
                    password: body.password,
                }),
                cache: "no-store",
                signal: AbortSignal.timeout(10_000),
            },
        );
    } catch {
        return fail(
            "Authentication service is temporarily unavailable",
            503,
            "BACKEND_UNAVAILABLE",
        );
    }

    let result;

    try {
        result = await upstream.json();
    } catch {
        return fail(
            "Authentication service returned an invalid response",
            502,
            "INVALID_BACKEND_RESPONSE",
        );
    }

    if (!upstream.ok) {
        // Forward only the expected public authentication errors.
        if (
            upstream.status === 400 &&
            result?.error?.code === "VALIDATION_ERROR"
        ) {
            return fail(
                "Check your email and password format",
                400,
                "VALIDATION_ERROR",
            );
        }

        if (upstream.status === 401) {
            return fail(
                "Invalid email or password",
                401,
                "INVALID_CREDENTIALS",
            );
        }

        return fail(
            "Authentication service could not complete the request",
            502,
            "BACKEND_ERROR",
        );
    }

    const { accessToken, refreshToken, user } = result?.data || {};

    if (
        typeof accessToken !== "string" ||
        !accessToken ||
        typeof refreshToken !== "string" ||
        !refreshToken ||
        !user ||
        typeof user.id !== "string"
    ) {
        return fail(
            "Authentication service returned incomplete data",
            502,
            "INVALID_BACKEND_RESPONSE",
        );
    }

    const response = NextResponse.json(
        {
            success: true,
            message: "Logged in successfully",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        },
        {
            headers: { "Cache-Control": "no-store" },
        },
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    };

    response.cookies.set("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60,
    });

    response.cookies.set("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60,
    });

    return response;
}