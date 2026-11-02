import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
} from "@/lib/server/backend";

export async function GET(request) {
    try {
        const accessToken = getAccessToken(request);

        const params = new URLSearchParams();

        const allowedParams = [
            "page",
            "limit",
            "search",
            "category",
            "inStock",
            "sort",
            "status",
        ];

        for (const key of allowedParams) {
            const values = request.nextUrl.searchParams.getAll(key);

            if (values.length > 1) {
                throw new ApiError(
                    `Provide '${key}' only once`,
                    400,
                    "VALIDATION_ERROR",
                );
            }

            if (values.length === 1) {
                params.set(key, values[0]);
            }
        }

        const result = await backendRequest(
            `/api/v1/products/admin?${params.toString()}`,
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