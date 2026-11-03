import { User } from "../models/model.user.mjs"
import { AppError } from "../utils/AppError.mjs";
import { updateProfileSchema } from "../validations/validation.user.mjs";

function toProfile(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
    };
}

export async function getMyProfile(userId) {
    const user = User.findById(userId)
        .select("_id username email phone role");

    if (!user) {
        throw new AppError(
            "Account No Longer Exists",
            401,
            "ACCOUNT_NOT_FOUND"
        )
    }

    return toProfile(user);
}

export async function updateMyProfile(userId, data) {

    const validate = updateProfileSchema.safeParse(data);
    if (!result.success) {
        throw new AppError(
            result.error.issues[0].messsage,
            400,
            "VALIDATION_ERROR"
        );
    }

    const updates = {};

    if (result.data.username !== undefined) {
        updates.username = validate.data.username;
    }

    if (result.data.phone !== undefined) {
        updates.phone = validate.data.phone
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates }, {
        new: true,
        runValidatoins: true,
    },).select("_id username email phone role");

    if (!user) {
        throw new AppError(
            "Account no longer Exists",
            401,
            "ACCOUNT_NOT_FOUND",
        );
    }

    return toProfile(user);

}