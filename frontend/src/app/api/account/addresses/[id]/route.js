import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

function addressPath(id) {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        throw new ApiError(
            "Invalid address ID",
            400,
            "VALIDATION_ERROR",
        );
    }

    return `/api/address/${id}`;
}

export async function PUT(request, context) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);
        const { id } = await context.params;
        const path = addressPath(id);

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
            method: "PUT",
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

export async function DELETE(request, context) {
    try {
        requireOrigin(request);

        const token = getAccessToken(request);
        const { id } = await context.params;

        const result = await backendRequest(addressPath(id), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}