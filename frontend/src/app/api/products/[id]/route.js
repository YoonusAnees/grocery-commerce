import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

function productPath(id) {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        throw new ApiError(
            "Invalid product ID",
            400,
            "VALIDATION_ERROR",
        );
    }

    return `/api/v1/products/${id}`;
}

export async function GET(request, context) {
    try {
        const { id } = await context.params;

        const result = await backendRequest(productPath(id));

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(request, context) {
    try {
        requireOrigin(request);

        const accessToken = getAccessToken(request);
        const { id } = await context.params;
        const path = productPath(id);

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

        const result = await backendRequest(path, {
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