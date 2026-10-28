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

function clearAuthCookies(response) {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    };

    response.cookies.set("accessToken", "", options);
    response.cookies.set("refreshToken", "", options);

    return response;
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

    if (request.headers.get("origin") !== appOrigin) {
        return fail(
            "Request origin is not allowed",
            403,
            "FORBIDDEN_ORIGIN",
        );
    }

    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
        return clearAuthCookies(
            fail(
                "Please log in again",
                401,
                "AUTHENTICATION_REQUIRED",
            ),
        );
    }

    let upstream;

    try {
        upstream = await fetch(
            `${backendUrl}/api/auth/refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
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

    // Express rejects malformed, expired, or replaced refresh tokens.
    if (upstream.status === 400 || upstream.status === 401) {
        return clearAuthCookies(
            fail(
                "Session is invalid or expired. Please log in again.",
                401,
                "INVALID_SESSION",
            ),
        );
    }

    if (!upstream.ok) {
        return fail(
            "Authentication service could not complete the request",
            502,
            "BACKEND_ERROR",
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

    const tokens = result?.data;

    if (
        result?.success !== true ||
        typeof tokens?.accessToken !== "string" ||
        !tokens.accessToken ||
        typeof tokens?.refreshToken !== "string" ||
        !/^[a-f0-9]{128}$/.test(tokens.refreshToken)
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
            message: "Session refreshed successfully",
        },
        {
            headers: { "Cache-Control": "no-store" },
        },
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    };

    response.cookies.set("accessToken", tokens.accessToken, {
        ...options,
        maxAge: 15 * 60,
    });

    // No new maxAge: rotating the token must not imply
    // that Express extended the session's seven-day deadline.
    response.cookies.set(
        "refreshToken",
        tokens.refreshToken,
        options,
    );

    return response;
}