import z from "zod";
import { Endpoint } from "../package";
import { userModel } from "../../mongo/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CONFIG from "../../config";
import { setSecureCookie } from "../util/cookies";

const loginBodySchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must not exceed 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must not exceed 50 characters"),
});

export const endpoint = new Endpoint("post", "/v1/login").withBody(loginBodySchema).onCall(async (req, res) => {
    const { username, password } = req.body as z.infer<typeof loginBodySchema>;

    // Find User
    try {
        const user = await userModel.findOne({ username });
        if (!user) return res.status(401).json({
            error: "Invalid credentials",
            message: "The provided username or password is incorrect"
        });

        // Verify Password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return res.status(401).json({
            error: "Invalid credentials",
            message: "The provided username or password is incorrect"
        });

        // Sign Token
        const token = jwt.sign({ id: user.id }, CONFIG.jwt.secret, { expiresIn: CONFIG.jwt.expiresIn as any });

        // Set Cookie / Header for Token
        if (CONFIG.env.apiProxyEnabled) {
            // When the API proxy is enabled, we'll set a response header to inform the proxy to set the cookie for us
            res.header("PROXY-SET-COOKIES", JSON.stringify({ token }));
        } else {
            // Otherwise we set the cookie ourselves
            setSecureCookie(res.cookie, "token", token);
        }

        // Successful Login
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username
            },
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: "An error occurred while retrieving user data",
            details: (error as Error).message || "Unknown Error"
        });
    }
});