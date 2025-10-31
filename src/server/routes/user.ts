import CONFIG from "../../config";
import { userModel } from "../../mongo/models/user";
import { Endpoint } from "../package";
import jwt from "jsonwebtoken";

export const endpoint = new Endpoint("get", "/v1/me", async (req, res) => {
    let token = req.cookies?.["token"];

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);

    if (!token) {
        res.status(401).json({ error: "NO_TOKEN", message: "No token provided" });
        return;
    }

    const tokenPayload = jwt.verify(token, CONFIG.jwt.secret);

    if (typeof tokenPayload !== "object" || !("id" in tokenPayload)) {
        res.status(401).json({ error: "INVALID_TOKEN", message: "Token payload is invalid" });
        return;
    }

    const user = await userModel.findOne({ id: tokenPayload.id });
    if (!user) {
        res.status(404).json({ error: "NO_USER", message: "User not found" });
        return;
    }

    const userObj = user.toObject();
    const { passwordHash, ...userWithoutPassword } = userObj;

    res.json({ success: true, user: userWithoutPassword });
});