import { open, stat } from "node:fs/promises";
import type { UploadFileParams } from "../apis/common";

export type NormalizedUploadSource = {
    size: number;
    readPart(start: number, end: number): Promise<BodyInit>;
};

export async function normalizeUploadSource(params: UploadFileParams): Promise<NormalizedUploadSource> {
    if (params.path && params.data !== undefined) {
        throw new TypeError("Provide either path or data, not both.");
    }

    if (params.path) {
        const fileStat = await stat(params.path);

        return {
            size: fileStat.size,
            async readPart(start, end) {
                const handle = await open(params.path!, "r");

                try {
                    const buffer = Buffer.alloc(end - start);
                    const result = await handle.read(buffer, 0, buffer.length, start);

                    return buffer.subarray(0, result.bytesRead) as unknown as BodyInit;
                }
                finally {
                    await handle.close();
                }
            }
        };
    }

    if (params.data === undefined) {
        throw new TypeError("Upload requires path or data.");
    }

    const bytes = await toUint8Array(params.data);

    return {
        size: bytes.byteLength,
        async readPart(start, end) {
            return bytes.subarray(start, end) as unknown as BodyInit;
        }
    };
}

async function toUint8Array(data: NonNullable<UploadFileParams["data"]>) {
    if (typeof data === "string") {
        return new TextEncoder().encode(data);
    }

    if (data instanceof Uint8Array) {
        return data;
    }

    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }

    if (typeof Blob !== "undefined" && data instanceof Blob) {
        return new Uint8Array(await data.arrayBuffer());
    }

    return new Uint8Array(data as unknown as ArrayBuffer);
}
