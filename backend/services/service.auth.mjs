import { User } from "../models/model.user.mjs";
import { registerSchema, loginSchema } from "../validations/validation.auth.mjs";
import { hashPassword, comparePassword } from "../utils/helper.mjs";
import { AppError } from "../utils/AppError.mjs";
// import { createAccessToken } from "../utils/token.mjs";
import { createSession } from "./service.session.mjs";




export async function registerUser(body) {
    const validData = registerSchema.safeParse(body);
    console.log(validData)

    if (!validData.success) {
        throw new AppError(
            validData.error.issues[0].message,
            400,
            "VALIDATION_ERROR",
        );
    }

    const { username, email, password } = validData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError(
            "Email already exists",
            400,
            "EMAIL_ALREADY_EXISTS",
        );
    }

    const hashedPassword = hashPassword(password);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "customer",
    });

    return {
        success: true,
        message: "User registered successfully",
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };
}

export async function loginUser(body) {
    const validData = loginSchema.safeParse(body);

    if (!validData.success) {
        throw new AppError(
            validData.error.issues[0].message,
            400,
            "VALIDATION_ERROR",
        );
    }

    const { email, password } = validData.data;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new AppError(
            "Invalid email or password",
            401,
            "INVALID_CREDENTIALS"
        )
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new AppError(
            "Invalid email or password",
            401,
            "INVALID_CREDENTIALS",
        );
    }

    const tokens = await createSession(user.id);

    return {
        ...tokens,
        // accessToken: createAccessToken(user.id),
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    }




}

