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

    if (refreshToken) {
        let upstream;

        try {
            upstream = await fetch(
                `${backendUrl}/api/auth/logout`,
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
                "Could not confirm logout. Please try again.",
                503,
                "BACKEND_UNAVAILABLE",
            );
        }

        if (!upstream.ok) {
            return fail(
                "Could not confirm logout. Please try again.",
                502,
                "BACKEND_ERROR",
            );
        }
    }

    const response = NextResponse.json(
        {
            success: true,
            message: "Logged out successfully",
        },
        {
            headers: { "Cache-Control": "no-store" },
        },
    );

    return clearAuthCookies(response);
}