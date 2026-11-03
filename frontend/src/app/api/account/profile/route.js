import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

export async function GET(request) {
    try {
        const accessToken = getAccessToken(request);

        const result = await backendRequest("/api/v1/users/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(request) {
    try {
        requireOrigin(request);

        const accessToken = getAccessToken(request);

        let body;

        try {
            body = await request.json();
        } catch {
            throw new ApiError(
                "Request body must contain valid JSON",
                400,
                "INVALID_JSON",
            );
        }

        const result = await backendRequest("/api/v1/users/me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}