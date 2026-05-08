import type { EndpointDefinition } from "./apis/common";
import type { QueryObject } from "./query";
import type { HttpMethod, Transport } from "./transport";

export function executeEndpoint<Request extends Record<string, unknown>, Response>(
    transport: Transport,
    endpoint: EndpointDefinition<Request, Response>,
    request: Request
) {
    const query = pick(request, endpoint.queryParams) as QueryObject | undefined;
    const body = pick(request, endpoint.bodyParams);

    return transport.request<Response>({
        method: endpoint.method.toUpperCase() as HttpMethod,
        path: endpoint.path(request),
        ...(query ? { query } : {}),
        ...(body ? { body } : {})
    });
}

function pick(source: Record<string, unknown>, keys?: readonly string[]) {
    if (!keys?.length) {
        return undefined;
    }

    const picked = Object.fromEntries(keys.filter(key => source[key] !== undefined).map(key => [key, source[key]]));

    return Object.keys(picked).length ? picked : undefined;
}
