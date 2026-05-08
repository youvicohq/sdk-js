export const DEFAULT_BASE_URL = "https://api.youvico.com/api";

export type FetchLike = typeof fetch;

/**
 * Options used to configure a Youvico API client.
 */
export type ClientOptions = {
    /**
     * API key used to authenticate requests.
     */
    apiKey: string;

    /**
     * Base URL for the Youvico API.
     */
    baseUrl?: string;

    /**
     * Custom fetch implementation.
     */
    fetch?: FetchLike;

    /**
     * Request timeout in milliseconds.
     */
    timeoutMs?: number;

    /**
     * Additional headers sent with every request.
     */
    headers?: Record<string, string>;
};

export type ResolvedClientOptions = {
    apiKey: string;
    baseUrl: string;
    fetch: FetchLike;
    timeoutMs?: number;
    headers: Record<string, string>;
};

export function resolveClientOptions(options: ClientOptions): ResolvedClientOptions {
    const fetchImpl = options.fetch ?? globalThis.fetch;

    if (!fetchImpl) {
        throw new Error("A fetch implementation is required.");
    }

    const resolved: ResolvedClientOptions = {
        apiKey: options.apiKey,
        baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
        fetch: fetchImpl,
        headers: options.headers ?? {}
    };

    if (options.timeoutMs !== undefined) {
        resolved.timeoutMs = options.timeoutMs;
    }

    return resolved;
}
