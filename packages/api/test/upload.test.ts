import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Client } from "../src";

const tempDirs: string[] = [];

afterEach(async () => {
    await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
});

describe("files.upload", () => {
    it("starts, uploads parts, and completes a Uint8Array upload", async () => {
        const fetchMock = vi.fn(async (url: string) => {
            if (url.endsWith("/projects/p1/files/upload.multipart")) {
                return new Response(JSON.stringify({ data: { id: "file1", parts: [{ partNumber: 1, url: "https://upload.test/part1" }] } }), {
                    status: 201,
                    headers: { "content-type": "application/json" }
                });
            }

            if (url.endsWith("/files/file1/upload.complete")) {
                return new Response(null, { status: 204 });
            }

            return new Response(null, { status: 200, headers: { etag: "\"etag-1\"" } });
        });
        const client = new Client({
            apiKey: "secret",
            baseUrl: "https://api.example.test/api",
            fetch: fetchMock as typeof fetch
        });

        const result = await client.files.upload("p1", {
            name: "launch.mp4",
            data: new Uint8Array([1, 2, 3])
        });

        expect(result).toEqual({ id: "file1" });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://upload.test/part1",
            expect.objectContaining({
                method: "PUT",
                body: expect.any(Uint8Array)
            })
        );
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.test/api/files/file1/upload.complete",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ parts: [{ partNumber: 1, eTag: "\"etag-1\"" }] })
            })
        );
    });

    it("uploads from a Node file path", async () => {
        const dir = await mkdtemp(join(tmpdir(), "youvico-sdk-"));
        tempDirs.push(dir);
        const path = join(dir, "asset.txt");
        await writeFile(path, "hello");

        const fetchMock = vi.fn(async (url: string) => {
            if (url.endsWith("/projects/p1/files/upload.multipart")) {
                return new Response(JSON.stringify({ data: { id: "file1", parts: [{ partNumber: 1, url: "https://upload.test/part1" }] } }), {
                    status: 201,
                    headers: { "content-type": "application/json" }
                });
            }

            if (url.endsWith("/files/file1/upload.complete")) {
                return new Response(null, { status: 204 });
            }

            return new Response(null, { status: 200, headers: { etag: "etag-file" } });
        });

        const client = new Client({
            apiKey: "secret",
            baseUrl: "https://api.example.test/api",
            fetch: fetchMock as typeof fetch
        });

        await expect(client.files.upload("p1", { name: "asset.txt", path })).resolves.toEqual({ id: "file1" });
    });
});
