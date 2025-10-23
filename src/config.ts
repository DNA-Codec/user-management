export const CONFIG = {
    /** Configuration relating to the server */
    server: {
        /** The port for the server to run on */
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    },
    /** Configuration relating to logging */
    logger: {
        /** The logging level to use */
        level: process.env.LOG_LEVEL || "info",
    },
    /** Configuration relating to JWT */
    jwt: {
        /** The secret key for signing JWTs */
        secret: process.env.JWT_SECRET || "default_secret_key",
        /** The expiration time for JWTs */
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    /** Configuration relating to environment */
    env: {
        /** Whether the environment is production */
        production: process.env.NODE_ENV === "production" || false,
    },
    /** Database configuration */
    database: {
        /** The MongoDB connection URI */
        mongoUri: process.env.MONGO_URI,
    },
};

if (CONFIG.jwt.secret === "default_secret_key") {
    console.warn("Warning: Using default JWT secret key. This is not secure for production environments.");
}

export default CONFIG;