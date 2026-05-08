import { describe, expect, it, vi } from "vitest";
import { YouvicoError } from "../src/errors";
import { executeEndpoint } from "../src/execute-endpoint";
import { createTransport } from "../src/transport";
import { searchProject } from "../src/apis/project/search";

describe("transport", () => {
    it("sends auth, JSON body, and nested query params", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ data: [], page: { current: 1, hasNext: false } }), {
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

        await executeEndpoint(transport, searchProject, {
            query: "launch",
            sort: { type: "createdAt", direction: "desc" }
        });

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.test/api/projects/search?query=launch&sort.type=createdAt&sort.direction=desc",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    authorization: "Bearer secret"
                })
            })
        );
    });

    it("returns undefined for 204", async () => {
        const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
        const transport = createTransport({
            apiKey: "secret",
            baseUrl: "https://api.example.test/api",
            fetch: fetchMock as typeof fetch,
            headers: {}
        });

        await expect(transport.request({ method: "DELETE", path: "/files/f1" })).resolves.toBeUndefined();
    });

    it("throws YouvicoError with parsed body and headers", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ message: "Invalid API key", code: "INVALID_API_KEY_EXCEPTION", authenticated: false }), {
                status: 401,
                headers: {
                    "content-type": "application/json",
                    "x-ratelimit-reset": "123"
                }
            })
        );
        const transport = createTransport({
            apiKey: "bad",
            baseUrl: "https://api.example.test/api",
            fetch: fetchMock as typeof fetch,
            headers: {}
        });

        try {
            await transport.request({ method: "GET", path: "/projects/search" });
            throw new Error("Expected request to fail");
        }
        catch (error) {
            expect(error).toBeInstanceOf(YouvicoError);
            expect(error).toMatchObject({
                name: "YouvicoError",
                status: 401,
                code: "INVALID_API_KEY_EXCEPTION",
                authenticated: false
            });
            expect((error as YouvicoError).headers.get("x-ratelimit-reset")).toBe("123");
        }
    });
});
