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
        await client.files.update("file1", { description: "Ready", folder: { id: "folder1" } });
        await client.files.updateTag("file1", { tag: "APPROVED" });
        await client.files.delete("file1");
        await client.comments.list("file1");
        await client.comments.create("file1", { content: "Nice", anchor: 12, duration: 3 });
        await client.comments.replies("comment1");
        await client.reactions.list("comment1");
        await client.reactions.create("comment1", { type: "👍" });
        await client.reactions.delete("comment1", { type: "👍" });
        await client.skills.list();
        await client.skills.create({
            name: "Review Helper",
            description: "Summarizes review context.",
            metadata: { category: "review" },
            allowedTools: ["browser"],
            license: "MIT"
        });
        await client.skills.get("SK1234567890ABCD");
        await client.skills.update("SK1234567890ABCD", {
            name: "Updated Helper",
            default: { id: "SV1234567890ABCD" }
        });
        await client.skills.update("SK1234567890ABCD", {
            metadata: null,
            allowedTools: null,
            license: null
        });
        await client.skills.delete("SK1234567890ABCD");
        await client.skills.publishVersion("SK1234567890ABCD", {
            content: "Review body.",
            note: "Initial release.",
            isDefault: true
        });
        await client.skillVersions.get("SV1234567890ABCD");
        await client.skillVersions.delete("SV1234567890ABCD");

        const calls = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>).map(([url, init]) => ({ url, method: init.method }));
        const bodies = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>).map(([, init]) => init.body);
        expect(calls).toContainEqual({ url: "https://api.example.test/api/ping", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/search?query=launch&sort.type=createdAt&sort.direction=desc", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/p1", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/p1/folders", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/folders/f1", method: "PATCH" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/projects/p1/files", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/files/file1/upload.complete", method: "POST" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/files/file1/tag", method: "PATCH" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/comments/comment1/reactions", method: "DELETE" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skills", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skills", method: "POST" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skills/SK1234567890ABCD", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skills/SK1234567890ABCD", method: "PATCH" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skills/SK1234567890ABCD", method: "DELETE" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skills/SK1234567890ABCD/versions", method: "POST" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skill-versions/SV1234567890ABCD", method: "GET" });
        expect(calls).toContainEqual({ url: "https://api.example.test/api/skill-versions/SV1234567890ABCD", method: "DELETE" });
        expect(bodies).toContain(JSON.stringify({ description: "Ready", folder: { id: "folder1" } }));
        expect(bodies).toContain(JSON.stringify({ content: "Nice", anchor: 12, duration: 3 }));
        expect(bodies).toContain(JSON.stringify({
            name: "Review Helper",
            description: "Summarizes review context.",
            metadata: { category: "review" },
            allowedTools: ["browser"],
            license: "MIT"
        }));
        expect(bodies).toContain(JSON.stringify({
            name: "Updated Helper",
            default: { id: "SV1234567890ABCD" }
        }));
        expect(bodies).toContain(JSON.stringify({
            metadata: null,
            allowedTools: null,
            license: null
        }));
        expect(bodies).toContain(JSON.stringify({
            content: "Review body.",
            note: "Initial release.",
            isDefault: true
        }));
    });

    it("sends comment replies with parent object", async () => {
        const { client, fetchMock } = createClient();

        await client.comments.create("file1", { content: "Reply", parent: { id: "comment1" } });

        const body = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>)[0]?.[1].body;

        expect(body).toBe(JSON.stringify({ content: "Reply", parent: { id: "comment1" } }));
    });

    it("sends null comment parent when provided", async () => {
        const { client, fetchMock } = createClient();

        await client.comments.create("file1", { content: "Top-level", parent: null });

        const body = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>)[0]?.[1].body;

        expect(body).toBe(JSON.stringify({ content: "Top-level", parent: null }));
    });

    it("rejects unsupported reaction emoji before sending a request", async () => {
        const { client, fetchMock } = createClient();

        expect(() => client.reactions.create("comment1", { type: "not-emoji" })).toThrow("Unsupported reaction emoji");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
