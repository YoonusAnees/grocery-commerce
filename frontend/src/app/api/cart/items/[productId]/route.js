import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

export async function PUT(request, context) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);
        const { productId } = await context.params;

        if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
            throw new ApiError(
                "Invalid product ID",
                400,
                "VALIDATION_ERROR",
            );
        }

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

        const result = await backendRequest(
            `/api/v1/cart/items/${productId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            },
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}