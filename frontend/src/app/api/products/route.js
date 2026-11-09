import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

// export async function GET(request) {
//     try {


//         const query = request.nextUrl.searchParams;

//         const page = query.get("page") ?? "1";
//         const limit = query.get("limit") ?? "12";

//         const params = new URLSearchParams({ page, limit });

//         const result = await backendRequest(
//             `/api/v1/products?${params.toString()}`,
//         );

//         return json(result);
//     } catch (error) {
//         return handleError(error);
//     }
// }


export async function GET(request) {
    try {
        const params = new URLSearchParams();

        const allowedParams = [
            "page",
            "limit",
            "search",
            "category",
            "inStock",
            "sort",
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
            `/api/products?${params.toString()}`,
        );

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}



export async function POST(request) {
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

        const result = await backendRequest("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        return json(result, 201);
    } catch (error) {
        return handleError(error);
    }
}