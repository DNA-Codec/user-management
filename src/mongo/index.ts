import mongoose from "mongoose";
import { BootLoader } from "../boot";
import { getLogger } from "../util/logger";
import CONFIG from "../config";

const logger = getLogger("MONGO");

new BootLoader(async () => {
    try {
        const mongoUri = CONFIG.database.mongoUri;
        if (!mongoUri) throw new Error("MONGO_URI environment variable is not set.");

        await mongoose.connect(mongoUri);
        return true;
    } catch (error) {
        logger.error("Failed to connect to MongoDB:", error);
        return false;
    }
})