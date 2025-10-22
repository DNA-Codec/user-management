import mongoose from "mongoose";
import { BootLoader } from "../boot";

new BootLoader(async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/user-management";
        await mongoose.connect(mongoUri);
        return true;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        return false;
    }
})