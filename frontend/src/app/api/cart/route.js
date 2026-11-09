import {
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

export async function GET(request) {
    try {
        const token = getAccessToken(request);

        const result = await backendRequest("/api/cart", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return json(result);
    } catch (error) {
        return handleError(error);
    }
}


export async function DELETE(request) {
    try {
        requireOrigin(request);
        const token = getAccessToken(request);

        const result = await backendRequest("/api/cart", {
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