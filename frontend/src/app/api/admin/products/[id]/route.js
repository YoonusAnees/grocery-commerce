import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
} from "@/lib/server/backend";

export async function GET(request, context) {
    try {
        const accessToken = getAccessToken(request);
        const { id } = await context.params;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new ApiError(
                "Invalid product ID",
                400,
                "VALIDATION_ERROR",
            );
        }

        const result = await backendRequest(
            `/api/v1/products/admin/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}