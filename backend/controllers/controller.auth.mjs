
import { protect } from "../middlewares/middleware.mjs";
import { registerUser, loginUser } from "../services/service.auth.mjs";
import { refreshSession, logoutSession } from "../services/service.session.mjs";


export async function register(req, res, next) {
    try {
        const result = await registerUser(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Account creation failed",
                error: result.message,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                id: result.id,
                username: result.username,
                email: result.email,
                role: result.role,
            },
        });
    } catch (error) {
        next(error);
    }
}


export async function login(req, res, next) {
    try {
        const data = await loginUser(req.body);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export const profile = (req, res) => {
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        data: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
        },
    });
};

export const refresh = async (req, res, next) => {
    try {

        const token = await refreshSession(req.body);
        res.set("Cashe-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Session refreshed successfully",
            data: token
        });

    } catch (error) {
        return next(error);
    }
};


export const logout = async (req, res, next) => {
    try {
        const data = await logoutSession(req.body);
        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "User logged out successfully",
            data: data
        });

    } catch (error) {
        return next(error);
    }
};


