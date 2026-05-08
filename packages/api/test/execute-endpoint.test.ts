import { describe, expect, it, vi } from "vitest";
import type { EndpointDefinition } from "../src/apis/common";
import { executeEndpoint } from "../src/execute-endpoint";
import { createTransport } from "../src/transport";

describe("executeEndpoint", () => {
    it("does not require endpoint definitions to carry a runtime response value", async () => {
        type Request = { id: string };
        type Response = { data: { id: string } };

        const endpoint: EndpointDefinition<Request, Response> = {
            method: "get",
            path: request => `/items/${request.id}`
        };
        const fetchMock = vi.fn(async () =>
            new globalThis.Response(JSON.stringify({ data: { id: "item1" } }), {
                status: 200,
                headers: { "content-type": "application/json" }
            })
        );
        const transport = createTransport({
            apiKey: "secret",
            baseUrl: "https://api.example.test/api",
            fetch: fetchMock as typeof fetch,
            headers: {}
        });

        const result = await executeEndpoint(transport, endpoint, { id: "item1" });

        expect(result.data.id).toBe("item1");
    });
});
