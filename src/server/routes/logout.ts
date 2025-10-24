import jwt from "jsonwebtoken";
import CONFIG from "../../config";
import { userModel } from "../../mongo/models/user";
import { Endpoint } from "../package";
import { getSecureCookieOptions } from "../util/cookies";

export const endpoint = new Endpoint("post", "/v1/logout", async (req, res) => {
    const cookies = req.cookies;
    const token = cookies["token"];

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

    res.cookie("token", "", getSecureCookieOptions({ maxAge: 0 }));
    res.json({ success: true, message: "Logged out successfully" });
});