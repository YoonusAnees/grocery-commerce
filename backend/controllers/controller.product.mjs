import { createProduct, getProducts } from "../services/service.product.mjs";

export async function createProducts(req, res, next) {
    try {
        const product = await createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        return next(error);
    }
}


export async function getAllProducts(req, res, next) {
    try {
        const products = await getProducts(req.query);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error) {
        return next(error);
    }
}


export async function updateProduct(req, res, next) {
    try {
        const product = await updateProduct(req.params.id, req.body);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        return next(error);
    }
}


export async function deleteProduct(req, res, next) {
    try {
        const product = await deleteProduct(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product,
        });
    } catch (error) {
        return next(error);
    }
}