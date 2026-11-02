import { createProductSchema, listProductsSchema, updateSchema, adminListProductsSchema } from "../validations/validation.product.mjs";
import { Product } from "../models/model.product.mjs";
import { AppError } from "../utils/AppError.mjs";
import { Category } from "../models/model.category.mjs";
import { verifyProductImage } from "../utils/helper.mjs";
import mongoose from "mongoose";


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


async function listProducts(options, baseFilter) {
    const {
        page,
        limit,
        search,
        category,
        inStock,
        sort,
    } = options;

    const filter = { ...baseFilter };

    if (search) {
        filter.name = {
            $regex: escapeRegex(search),
            $options: "i",
        };
    }

    if (category) {
        filter.category = category;
    }

    if (inStock === "true") {
        filter.stock = { $gt: 0 };
    } else if (inStock === "false") {
        filter.stock = 0;
    }

    const sortOptions = {
        newest: { createdAt: -1, _id: -1 },
        priceAsc: { priceMinor: 1, _id: 1 },
        priceDesc: { priceMinor: -1, _id: 1 },
        name: { name: 1, _id: 1 },
    };

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort(sortOptions[sort])
            .skip((page - 1) * limit)
            .limit(limit),

        Product.countDocuments(filter),
    ]);

    return {
        items: products.map(toProductResponse),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
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
        isActive: product.isActive,
        image: {
            publicId: product.image.publicId,
            url: product.image.url
        },
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
    };
}


function validateProductId(id) {
    if (typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)) {
        throw new AppError(
            "Invalid product ID",
            400,
            "VALIDATOIN_ERROR"
        );
    }
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    const uploadedImage = await verifyProductImage(validData.imagePublicId);

    const allowedType = ["jpeg", "png", "webp", "jpeg"];

    if (!allowedType.includes(uploadedImage.format) || typeof uploadedImage.secure_url !== "string"
        || !uploadedImage.secure_url.startsWith("https://")) {
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
        uploadedImage,
    });

    return toProductResponse(product);
}


export async function getProducts(query) {
    const options = validate(listProductsSchema, query);

    return listProducts(options, { isActive: true });
}

export async function getAdminProducts(query) {
    const { status, ...options } = validate(
        adminListProductsSchema,
        query,
    );

    const filter = {};

    if (status === "active") {
        filter.isActive = true;
    } else if (status === "inactive") {
        filter.isActive = false;
    }

    return listProducts(options, filter);
}


export async function getAdminProductById(id) {
    validateProductId(id);

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError(
            "Product not found",
            404,
            "PRODUCT_NOT_FOUND",
        );
    }

    return toProductResponse(product);
}


export async function getProductById(id) {
    validateProductId(id);

    const product = await Product.findOne({
        _id: id,
        idActive: true,
    });

    if (!product) {
        throw new AppError(
            "Product not found",
            404,
            "PRODUCT_NOT_FOUND"
        )
    }

    return toProductResponse(product);


}

export async function updateProduct(id, data) {
    validateProductId(id);

    const validDate = validate(updateSchema, data);

    const productExist = await Product.exists({ _id: id });

    if (!productExist) {
        throw new AppError(
            "Product not found",
            404,
            "Product_NOT_FOUND"
        )
    }

    if (!validDate.category !== undefined) {
        const categoryExist = await Category.exists({
            _id: validDate.category,
        })

        if (!categoryExist) {
            throw new AppError(
                "Category not found",
                404,
                "CATEGORY_NOT_FOUND"
            );
        }
    }

    const updates = {};

    for (const field of [
        "name",
        "description",
        "category",
        "priceMinor",
        "isActive"
    ]) {
        if (validDate[field] !== undefined) {
            updates[field] = validDate[field]
        }
    }

    if (validDate.imagePublicId !== undefined) {
        updates.image = await verifyProductImage(
            validDate.imagePublicId,
        );
    }

    const product = await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        {
            new: true,
            runValidators: true,
        },
    );

    if (!product) {
        AppError(
            "Product Not Found",
            404,
            "PRODUCT_NOT_FOUND"

        );
    }

    return toProductResponse(product)

}
