import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import z, { success } from "zod";
import CONFIG from "../../config";
import { userModel } from "../../mongo/models/user";
import { Endpoint } from "../package";
import { getSecureCookieOptions } from "../util/cookies";

const loginBodySchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must not exceed 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must not exceed 50 characters"),
});

export const endpoint = new Endpoint("post", "/v1/login").withBody(loginBodySchema).onCall(async (req, res) => {
    const { username, password } = req.body as z.infer<typeof loginBodySchema>;

    console.log(`Login attempt for username: ${username}`);

    // Find User
    try {
        const user = await userModel.findOne({ username });
        if (!user) return res.status(401).json({
            success: false,
            error: "Invalid credentials",
            message: "The provided username or password is incorrect"
        });

        // Verify Password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return res.status(401).json({
            success: false,
            error: "Invalid credentials",
            message: "The provided username or password is incorrect"
        });

        // Sign Token
        const token = jwt.sign({ id: user.id }, CONFIG.jwt.secret, { expiresIn: CONFIG.jwt.expiresIn as any });
        res.cookie("token", token, getSecureCookieOptions());

        // Successful Login
        console.log(`User logged in successfully: ${username}`);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username
            },
        });
    } catch (error) {
        console.error(`Error occurred during login for user: ${username}`, error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: "An error occurred while retrieving user data",
            details: (error as Error).message || "Unknown Error"
        });
    }
});