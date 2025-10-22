import mongoose from "mongoose";
import { BootLoader } from "../boot";

new BootLoader(async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error("MONGO_URI environment variable is not set.");

        await mongoose.connect(mongoUri);
        return true;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        return false;
    }
})