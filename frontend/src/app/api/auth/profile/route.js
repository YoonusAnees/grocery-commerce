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

export async function GET(request) {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        return fail(
            "Backend is not configured",
            500,
            "CONFIGURATION_ERROR",
        );
    }

    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
        return fail(
            "An access token is required",
            401,
            "AUTHENTICATION_REQUIRED",
        );
    }

    let upstream;

    try {
        upstream = await fetch(
            `${backendUrl}/api/auth/profile`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "no-store",
                signal: AbortSignal.timeout(10_000),
            },
        );
    } catch {
        return fail(
            "Profile service is temporarily unavailable",
            503,
            "BACKEND_UNAVAILABLE",
        );
    }

    let result;

    try {
        result = await upstream.json();
    } catch {
        return fail(
            "Profile service returned an invalid response",
            502,
            "INVALID_BACKEND_RESPONSE",
        );
    }

    if (!upstream.ok) {
        if (upstream.status === 401) {
            const expired = result?.error?.code === "TOKEN_EXPIRED";

            return fail(
                expired
                    ? "Access token has expired"
                    : "Please authenticate again",
                401,
                expired ? "TOKEN_EXPIRED" : "AUTHENTICATION_REQUIRED",
            );
        }

        return fail(
            "Profile service could not complete the request",
            502,
            "BACKEND_ERROR",
        );
    }

    const user = result?.data;

    if (
        result?.success !== true ||
        typeof user?.id !== "string" ||
        typeof user?.username !== "string" ||
        typeof user?.role !== "string"
    ) {
        return fail(
            "Profile service returned incomplete data",
            502,
            "INVALID_BACKEND_RESPONSE",
        );
    }

    return NextResponse.json(
        {
            success: true,
            message: "User profile fetched successfully",
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        },
        {
            headers: { "Cache-Control": "no-store" },
        },
    );
}