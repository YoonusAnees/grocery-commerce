import { getMyProfile, updateMyProfile } from "../services/services.user.mjs";


export async function getProfile(req, res, next) {
    try {
        const user = await getMyProfile(req.user.id);
        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            data: user
        })

    } catch (error) {
        return next(error)
    }
}

export async function updateProfile(req, res, next) {
    try {

        const user = await updateMyProfile(
            req.user.id,
            req.body
        );
        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            data: user,
        })



    } catch (error) {
        return next(error);
    }
}