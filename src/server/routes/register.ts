import z from "zod";
import { Endpoint } from "../package";
import { userModel } from "../../mongo/models/user";
import bcrypt from "bcrypt";

const registerBodySchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must not exceed 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must not exceed 50 characters"),
});

async function userExists(username: string) {
    try {
        const existingUser = await userModel.findOne({ username });
        return existingUser !== null;
    } catch (error) {
        throw new Error("Database query failed");
    }
}

export const endpoint = new Endpoint("post", "/v1/register", async (req, res) => {
    // Validate Body
    const parseResult = registerBodySchema.safeParse(req.body);
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

    // // Handle Registration
    const { username, password } = parseResult.data;

    // Check if user already exists
    try {
        if (await userExists(username)) return res.status(409).json({
            error: "User already exists",
            message: `A user with the username '${username}' already exists`
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: "An error occurred while checking for existing user",
            details: (error as Error).message || "Unknown Error"
        });
    }

    // Create User
    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new userModel({ username, passwordHash });
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                username: newUser.username
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: "An error occurred while registering the user",
            details: (error as Error).message || "Unknown Error"
        });
    }
});