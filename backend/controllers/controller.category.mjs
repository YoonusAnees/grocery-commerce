import { success } from "zod";
import { createCategory, getCategories } from "../services/service.category.mjs";

export async function create(req, res, next) {
    try {
        const category = await createCategory(req.body);
        return res.status(201).json({
            success: true,
            message: "Created category successfully",
            data: category
        })

    } catch (error) {
        return next(error);
    }
}

export async function getAll(req, res, next) {
    try {

        const categories = await getCategories();
        return res.status(200).json({
            success: true,
            message: "Categories fetched Successfully",
            data: categories
        })

    } catch (error) {
        return next(error);
    }
}