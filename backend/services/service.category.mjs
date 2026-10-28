import { Category } from "../models/model.category.mjs";
import { AppError } from "../utils/AppError.mjs"
import { createCategorySchema } from "../validations/validatoin.Category.mjs"



export async function createCategory(data) {
    const validData = createCategorySchema.safeParse(data);
    if (!validData.success) {
        throw new AppError(
            results.error.issue[0].message,
            400,
            "VALIDATION_ERROR"
        )
    }

    const { name } = validData.data;

    try {

        const category = await Category.create({
            name,
            namekey: name.toLowerCase().trim(),
        });

        return {
            id: category.id,
            name: category.name,
            createdAt: category.createdAt,
        };

    }
    catch (error) {
        if (error.code === 11000 & error.keyPattern.namekey) {
            throw new AppError(
                "A Category with this name already exists",
                409,
                "CATEGORY_ALREADY_EXISTS",
            );
        }

        throw error;
    }



}

export async function getCategories() {
    const categories = await Category.find()
        .select("_id name createdAt")
        .sort({ name: 1 });

    return categories.map((category) => ({
        id: category.id,
        name: category.name,
        createdAt: category.createdAt,
    }));
}