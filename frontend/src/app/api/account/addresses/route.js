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
        const token = getAccessToken(request);

        const result = await backendRequest("/api/address", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);

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

        const result = await backendRequest("/api/address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        return json(result, 201);
    } catch (error) {
        return handleError(error);
    }
}