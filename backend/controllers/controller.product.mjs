import { success } from "zod";
import { createProduct, getProducts, getAdminProducts, getAdminProductById, getProductById } from "../services/service.product.mjs";

export async function create(req, res, next) {
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


export async function getAll(req, res, next) {
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

export async function getOne(req, res, next) {
    try {

        const product = await getProductById(req.params.id);
        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        return next(error);
    }
}


export async function update(req, res, next) {
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

export async function getAllAdmin(req, res, next) {
    try {
        const data = await getAdminProducts(req.query);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getOneAdmin(req, res, next) {
    try {
        const product = await getAdminProductById(req.params.id);

        return res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        return next(error);
    }
}

