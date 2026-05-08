import type { ResolvedClientOptions } from "./client-options";
import { YouvicoError, type YouvicoErrorBody } from "./errors";
import { serializeQuery, type QueryObject } from "./query";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type RequestOptions = {
    method: HttpMethod;
    path: string;
    query?: QueryObject;
    body?: unknown;
    headers?: Record<string, string>;
};

export type Transport = {
    request<T = unknown>(options: RequestOptions): Promise<T>;
};

export function createTransport(options: ResolvedClientOptions): Transport {
    return {
        async request<T = unknown>(requestOptions: RequestOptions) {
            const controller = options.timeoutMs ? new AbortController() : undefined;
            const timeout = controller ? setTimeout(() => controller.abort(), options.timeoutMs) : undefined;

            try {
                const init: RequestInit = {
                    method: requestOptions.method,
                    headers: buildHeaders(options, requestOptions)
                };

                if (requestOptions.body !== undefined) {
                    init.body = JSON.stringify(requestOptions.body);
                }

                if (controller) {
                    init.signal = controller.signal;
                }

                const response = await options.fetch(buildUrl(options.baseUrl, requestOptions.path, requestOptions.query), init);

                if (!response.ok) {
                    throw await buildError(response);
                }

                if (response.status === 204) {
                    return undefined as T;
                }

                return (await response.json()) as T;
            }
            finally {
                if (timeout) {
                    clearTimeout(timeout);
                }
            }
        }
    };
}

function buildUrl(baseUrl: string, path: string, query?: QueryObject) {
    const normalizedBase = baseUrl.replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}${serializeQuery(query)}`;
}

function buildHeaders(options: ResolvedClientOptions, requestOptions: RequestOptions) {
    const headers: Record<string, string> = {
        ...lowercaseHeaders(options.headers),
        ...lowercaseHeaders(requestOptions.headers ?? {}),
        authorization: `Bearer ${options.apiKey}`
    };

    if (requestOptions.body !== undefined && !headers["content-type"]) {
        headers["content-type"] = "application/json";
    }

    return headers;
}

function lowercaseHeaders(headers: Record<string, string>) {
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
}

async function buildError(response: Response) {
    const body = await readErrorBody(response);
    const errorBody = isErrorBody(body) ? body : undefined;

    return new YouvicoError({
        status: response.status,
        message: errorBody?.message ?? response.statusText,
        code: errorBody?.code,
        authenticated: errorBody?.authenticated,
        headers: response.headers,
        body
    });
}

async function readErrorBody(response: Response) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    return await response.text();
}

function isErrorBody(value: unknown): value is YouvicoErrorBody {
    return typeof value === "object" && value !== null;
}
