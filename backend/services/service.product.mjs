import { createProductSchema, listProductsSchema } from "../validations/validation.product.mjs";
import { Product } from "../models/model.product.mjs";
import { AppError } from "../utils/AppError.mjs";
import { Category } from "../models/model.category.mjs";
import { create } from "../controllers/controller.category.mjs";


function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new AppError(
            result.error.issues[0].message,
            400,
            "VALIDATION_ERROR",
        );
    }
    return result.data;
}


export async function createProduct(data) {
    const validData = validate(createProductSchema, data);
    const categoryExists = await Category.exists({ _id: validData.category });

    if (!categoryExists) {
        throw new AppError(
            "Category not found",
            404,
            "CATEGORY_NOT_FOUND",
        );
    }

    let uploadedimage;

    try {

        uploadedimage = await cloudinary.api.resource(
            validData.imagePublicId,
            {
                resource_type: "image",
                type: "upload"
            },
        );

    } catch (error) {
        if (error.http_code === 404 || error.error?.http_code === 404) {
            throw new AppError(
                "Uploaded image not found",
                400,
                "IMAGE_NOT_FOUND"
            );
        }

        throw new AppError(
            "Could not verify the image. please try again",
            502,
            "IMAGE_VERIFY_FAILED"
        );

    }

    const allowedType = ["jpeg", "png", "webp", "jpeg"];

    if (!allowedType.includes(uploadedimage.format) || typeof uploadedimage.secure_url !== "string"
        || !uploadedimage.secure_url.startsWith("https://")) {
        throw new AppError(
            "The uploaded image is not supported",
            400,
            "INVALID_IMAGE_FORMAT"
        );
    }

    const product = await Product.create({
        name: validData.name,
        description: validData.description,
        category: validData.category,
        priceMinor: validData.priceMinor,
        currency: validData.currency,
        stock: validData.stock,
        image: {
            publicId: validData.imagePublicId,
            url: uploadedimage.secure_url
        }
    });

    return toProductResponse(product);
}


export async function getProducts(query) {
    const { page, limit } = validate(listProductsSchema, query);

    const [products, total] = await Promise.all(
        [Product.fine()
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit),

        Product.countDocuments(),

        ]
    );

    return {
        items: products.map(toProductResponse),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
    };

}


function toProductResponse(product) {
    return {
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.priceMinor,
        currency: product.currency,
        stock: product.stock,
        image: {
            publicId: product.image.publicId,
            url: product.image.url
        },
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
    };
}
