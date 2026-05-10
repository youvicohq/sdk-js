import { describe, expect, it, vi } from "vitest";
import { Client } from "../src";

function createClient(responseBody: unknown = { data: [] }) {
    const fetchMock = vi.fn(async () =>
        new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { "content-type": "application/json" }
        })
    );

    return {
        client: new Client({
            apiKey: "secret",
            baseUrl: "https://api.example.test/api",
            fetch: fetchMock as typeof fetch
        }),
        fetchMock
    };
}

describe("Client", () => {
    it("maps resource methods to documented paths", async () => {
        const { client, fetchMock } = createClient();

        await client.ping();
        await client.projects.search({ query: "launch", sort: { type: "createdAt", direction: "desc" } });
        await client.projects.get("p1");
        await client.folders.list("p1");
        await client.folders.create("p1", { name: "Renders" });
        await client.folders.update("f1", { name: "Finals" });
        await client.folders.delete("f1");
        await client.files.list("p1");
        await client.files.get("file1");
        await client.files.startMultipartUpload("p1", { name: "a.mp4", size: 10 });
        await client.files.completeUpload("file1", { parts: [{ partNumber: 1, eTag: "etag" }] });
        await client.files.uploadYoutube("p1", { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
        await client.files.update("file1", { description: "Ready" });
        await client.files.updateTag("file1", { tag: "APPROVED" });
        await client.files.delete("file1");
        await client.comments.list("file1");
        await client.comments.create("file1", { content: "Nice" });
        await client.comments.replies("comment1");
        await client.reactions.list("comment1");
        await client.reactions.create("comment1", { type: "👍" });
        await client.reactions.delete("comment1", { type: "👍" });

        const calls = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>).map(([url, init]) => ({ url, method: init.method }));
        expect(calls).toContainEqual({ url: "https://api.example.test/api/ping", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/search?query=launch&sort.type=createdAt&sort.direction=desc", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/p1", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/p1/folders", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/folders/f1", method: "PATCH" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/p1/files", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/files/file1/upload.complete", method: "POST" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/files/file1/tag", method: "PATCH" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/comments/comment1/reactions", method: "DELETE" });
    });

    it("rejects unsupported reaction emoji before sending a request", async () => {
        const { client, fetchMock } = createClient();

        expect(() => client.reactions.create("comment1", { type: "not-emoji" })).toThrow("Unsupported reaction emoji");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
