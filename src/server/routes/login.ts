import z from "zod";
import { Endpoint } from "../package";
import { userModel } from "../../mongo/models/user";
import bcrypt from "bcrypt";

const loginBodySchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must not exceed 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must not exceed 50 characters"),
});

export const endpoint = new Endpoint("post", "/v1/login", async (req, res) => {
    // Validate Body
    const parseResult = loginBodySchema.safeParse(req.body);
    if (!parseResult.success) {
        const formattedErrors = parseResult.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
        }));

        return res.status(400).json({
            error: "Validation failed",
            message: "The request body contains invalid fields",
            details: formattedErrors
        });
    }

    // // Handle Login
    const { username, password } = parseResult.data;

    // Find User
    try {
        const existingUser = await userModel.findOne({ username });
        if (!existingUser) return res.status(401).json({
            error: "Invalid credentials",
            message: "The provided username or password is incorrect"
        });

        // Verify Password
        const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordMatch) return res.status(401).json({
            error: "Invalid credentials",
            message: "The provided username or password is incorrect"
        });

        // Successful Login
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: existingUser.id,
                username: existingUser.username
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: "An error occurred while retrieving user data",
            details: (error as Error).message || "Unknown Error"
        });
    }
});