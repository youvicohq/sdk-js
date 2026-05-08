import type { FetchLike } from "../client-options";
import type { CompleteUploadPart, MultipartUpload, UploadFileResult } from "../apis/common";
import type { NormalizedUploadSource } from "./source";

export async function uploadMultipartParts(options: {
    fetch: FetchLike;
    source: NormalizedUploadSource;
    upload: MultipartUpload;
}): Promise<UploadFileResult & { parts: CompleteUploadPart[] }> {
    const sortedParts = [...options.upload.parts].sort((a, b) => a.partNumber - b.partNumber);
    const chunkSize = Math.ceil(options.source.size / sortedParts.length);
    const completedParts: CompleteUploadPart[] = [];

    for (const [index, part] of sortedParts.entries()) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, options.source.size);
        const body = await options.source.readPart(start, end);
        const response = await options.fetch(part.url, {
            method: "PUT",
            body
        });

        if (!response.ok) {
            throw new Error(`Failed to upload part ${part.partNumber}.`);
        }

        const eTag = response.headers.get("etag");

        if (!eTag) {
            throw new Error(`Upload part ${part.partNumber} did not return an ETag header.`);
        }

        completedParts.push({ partNumber: part.partNumber, eTag });
    }

    return {
        id: options.upload.id,
        parts: completedParts
    };
}
