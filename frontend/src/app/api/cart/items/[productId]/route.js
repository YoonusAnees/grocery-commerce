import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";
import { z } from "zod";

// 1. Zod schema for validating the cart update payload at the BFF layer
const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1).max(100),
}).strict();

// 2. Reusable Product ID validator
function validateProductId(productId) {
    if (!productId || !/^[a-fA-F0-9]{24}$/.test(productId)) {
        throw new ApiError(
            "Invalid product ID",
            400,
            "VALIDATION_ERROR"
        );
    }
}

export async function PUT(request, context) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);
        const params = await context.params;
        const productId = params?.productId;

        validateProductId(productId);

        let rawBody;
        try {
            rawBody = await request.json();
        } catch {
            throw new ApiError(
                "Request body must contain valid JSON",
                400,
                "INVALID_JSON"
            );
        }

        // Validate payload before hitting the backend network
        const validation = updateCartItemSchema.safeParse(rawBody);
        if (!validation.success) {
            throw new ApiError(
                validation.error.issues[0].message,
                400,
                "VALIDATION_ERROR"
            );
        }

        // Call backend (verify whether Express expects PUT or PATCH)
        const result = await backendRequest(
            `/api/cart/items/${productId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(validation.data),
            }
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(request, context) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);
        const params = await context.params;
        const productId = params?.productId;

        validateProductId(productId);

        const result = await backendRequest(
            `/api/cart/items/${productId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}