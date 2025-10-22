export const CONFIG = {
    /** Configuration relating to the server */
    server: {
        /** The port for the server to run on */
        port: 3000,
    },
    /** Configuration relating to logging */
    logger: {
        /** The logging level to use */
        level: "info",
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
        /** Whether this service's API proxy is enabled (will send edge actions to the API like setting cookies) */
        apiProxyEnabled: process.env.API_PROXY_ENABLED === "true" || process.env.API_PROXY_ENABLED === "1" || false,
        /** Whether the environment is production */
        production: process.env.NODE_ENV === "production" || false,
    }
};

if (CONFIG.jwt.secret === "default_secret_key") {
    console.warn("Warning: Using default JWT secret key. This is not secure for production environments.");
}

export default CONFIG;