import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

function inventoryPath(productId) {
    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
        throw new ApiError(
            "Invalid product ID",
            400,
            "VALIDATION_ERROR",
        );
    }

    return `/api/inventory/${productId}/adjustments`;
}

export async function GET(request, context) {
    try {
        const token = getAccessToken(request);
        const { productId } = await context.params;

        const result = await backendRequest(
            inventoryPath(productId),
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request, context) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);
        const { productId } = await context.params;
        const path = inventoryPath(productId);

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
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}