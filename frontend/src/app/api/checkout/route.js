import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

export async function POST(request) {
    try {
        requireOrigin(request);
        const token = getAccessToken(request);

        let body;
        try {
            body = await request.json();
        } catch {
            throw new ApiError("Request body must contain valid JSON", 400, "INVALID_JSON");
        }

        const result = await backendRequest("/api/checkout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        // Our current backendRequest helper returns JSON without the upstream status.
        return json(result);
    } catch (error) {
        return handleError(error);
    }
}