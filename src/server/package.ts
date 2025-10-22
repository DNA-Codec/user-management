import { Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { app } from ".";
import { getLogger } from "../util/logger";

// SETUP

const logger = getLogger("ENDPOINT.PACK");

/** Callback function of an endpoint */
type EndpointCall = (req: Request, res: Response) => any;

type EndpointMethod = "get" | "post" | "put" | "delete";

type EndpointValidationSchema = ZodType<any>;

type EndpointMiddleware = (req: Request, res: Response, next: Function) => any;

// HELPERS

function validateWithZodSchema(data: any, schema: EndpointValidationSchema): { success: boolean; data?: any; errors?: string[] } {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
            logger.debug(`(SCHEMA) Validation failed: ${errorMessages.join(", ")}`);
            return { success: false, errors: errorMessages };
        }
        logger.debug("(SCHEMA) Unknown validation error");
        return { success: false, errors: ["Unknown validation error"] };
    }
}

function validateRequestData(req: Request, res: Response, schema: EndpointValidationSchema | null, dataType: string): boolean {
    if (!schema) return true;

    const dataRegistry = {
        body: req.body,
        query: req.query,
    }

    if (!dataType || !(dataType in dataRegistry)) {
        res.status(500).json({ success: false, error: "Internal Server Error", message: "Invalid data type for validation." });
        return false;
    }

    const data = dataRegistry[dataType as keyof typeof dataRegistry];
    if (!data) {
        res.status(400).json({ success: false, error: "Bad Request", message: `No data found for request ${dataType} validation.` });
        return false;
    }

    const validation = validateWithZodSchema(data, schema);
    if (!validation.success) {
        logger.warn(`Request ${dataType} validation failed for route ${req.path}`);

        res.status(400).json({
            success: false,
            error: "Bad Request",
            message: `Request ${dataType} validation failed.`,
            validationErrors: validation.errors || [],
        });
        return false;
    }

    // Replace data with validated data (just overwrite body in both cases cause query is readonly)
    req.body = validation.data;

    return true;
}

/** Represents an API endpoint, listens via Express */
export class Endpoint {
    readonly method: EndpointMethod | EndpointMethod[];
    readonly path: string;
    private cb: EndpointCall = ((_, res) => res.status(502).json({ message: "No handler defined for this endpoint." }));

    private middleware: EndpointMiddleware[] = [];

    private schemas = {
        body: null as EndpointValidationSchema | null,
        query: null as EndpointValidationSchema | null,
    }

    constructor(method: EndpointMethod | EndpointMethod[], path: string, cb?: EndpointCall) {
        this.method = method;
        this.path = path;

        if (cb) {
            this.cb = cb;
            this.listen();
        }
    }

    /** Start the listener for this endpoint */
    private listen() {
        if (Array.isArray(this.method)) for (const m of this.method) this.subscribe(m);
        else this.subscribe(this.method);
    }

    /** Subscribe to an HTTP method */
    private subscribe(method: string) {
        app[method.toLowerCase() as keyof typeof app](this.path, this.middleware, (req: Request, res: Response) => {
            logger.debug(`Route called: ${this.method} on ${this.path}`);

            // Validate body and query
            for (const [dataType, schema] of Object.entries(this.schemas)) {
                if (!validateRequestData(req, res, schema, dataType)) return;
            }

            // Forward
            this.cb(req as Request, res);
        })
    }

    /** Add a schema to check on the request body */
    withBody(schema: EndpointValidationSchema): Endpoint {
        this.schemas.body = schema;
        return this;
    }

    /** Add a schema to check on the request query */
    withQuery(schema: EndpointValidationSchema): Endpoint {
        this.schemas.query = schema;
        return this;
    }

    /** Add handler to this endpoint */
    onCall(cb: EndpointCall): Endpoint {
        this.cb = cb;
        this.listen();
        return this;
    }
}