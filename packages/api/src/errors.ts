export type YouvicoErrorBody = {
    message?: string;
    code?: string;
    authenticated?: boolean;
    [key: string]: unknown;
};

/**
 * Error thrown when the Youvico API returns an unsuccessful response.
 */
export class YouvicoError extends Error {
    /**
     * HTTP status code returned by the API.
     */
    readonly status: number;

    /**
     * API error code, when provided.
     */
    readonly code: string | undefined;

    /**
     * Authentication state reported by the API, when provided.
     */
    readonly authenticated: boolean | undefined;

    /**
     * Response headers returned by the API.
     */
    readonly headers: Headers;

    /**
     * Parsed API error response body.
     */
    readonly body: unknown;

    constructor(options: {
        status: number;
        message: string;
        code: string | undefined;
        authenticated: boolean | undefined;
        headers: Headers;
        body: unknown;
    }) {
        super(options.message);
        this.name = "YouvicoError";
        this.status = options.status;
        this.code = options.code;
        this.authenticated = options.authenticated;
        this.headers = options.headers;
        this.body = options.body;
    }
}
