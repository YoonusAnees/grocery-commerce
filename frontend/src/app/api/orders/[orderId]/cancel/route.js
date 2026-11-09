import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

export async function POST(request, context) {
    try {
        requireOrigin(request);
        const token = getAccessToken(request);
        const { orderId } = await context.params;

        if (!/^[a-fA-F0-9]{24}$/.test(orderId)) {
            throw new ApiError("Invalid order ID", 400, "VALIDATION_ERROR");
        }

        const result = await backendRequest(
            `/api/v1/orders/${orderId}/cancel`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            },
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}