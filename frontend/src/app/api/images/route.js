import {
    ApiError,
    backendRequest,
    getAccessToken,
    handleError,
    json,
    requireOrigin,
} from "@/lib/server/backend";

export async function POST(request) {
    try {
        requireOrigin(request);

        const accessToken = getAccessToken(request);

        let form;

        try {
            form = await request.formData();
        } catch {
            throw new ApiError(
                "Request must contain valid multipart form data",
                400,
                "INVALID_UPLOAD",
            );
        }

        const entries = [...form.entries()];
        const image = form.get("image");

        if (
            entries.length !== 1 ||
            !(image instanceof File) ||
            image.size === 0
        ) {
            throw new ApiError(
                "Send exactly one image using the field name 'image'",
                400,
                "INVALID_UPLOAD",
            );
        }

        if (image.size > 5 * 1024 * 1024) {
            throw new ApiError(
                "Image must be 5 MB or smaller",
                413,
                "IMAGE_TOO_LARGE",
            );
        }

        const upload = new FormData();

        upload.set("image", image);

        const result = await backendRequest("/api/images", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: upload,
        });

        return json(result, 201);
    } catch (error) {
        return handleError(error);
    }
}