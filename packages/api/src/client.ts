import { assertReactionEmoji } from "./apis/emoji";
import { createComment, listComments, listReplies } from "./apis/comment";
import type { FileTag, UploadFileParams, UploadFileResult } from "./apis/common";
import {
    completeUpload,
    deleteFile,
    getFile,
    listFiles,
    startMultipartUpload,
    updateFile,
    updateFileTag,
    uploadYoutubeFile
} from "./apis/file";
import { createFolder, deleteFolder, listFolders, updateFolder } from "./apis/folder";
import { pingApi } from "./apis/ping";
import { getProject, searchProject, type SearchProjectsRequest } from "./apis/project";
import { createReaction, deleteReaction, listReactions } from "./apis/reaction";
import { resolveClientOptions, type ClientOptions } from "./client-options";
import { executeEndpoint } from "./execute-endpoint";
import { createTransport } from "./transport";
import { uploadMultipartParts } from "./upload/multipart";
import { normalizeUploadSource } from "./upload/source";

/**
 * API client for calling the Youvico HTTP API.
 */
export class Client {
    private readonly options;
    private readonly transport;

    /**
     * Check whether the configured API key can reach the API.
     */
    public ping = () => {
        return executeEndpoint(this.transport, pingApi, {});
    };

    /**
     * Project endpoints.
     */
    public readonly projects = {
        /**
         * Search projects accessible with the configured API key.
         */
        search: (params: SearchProjectsRequest) => {
            return executeEndpoint(this.transport, searchProject, params);
        },

        /**
         * Retrieve a project by ID.
         */
        get: (id: string) => {
            return executeEndpoint(this.transport, getProject, { id });
        }
    };

    /**
     * Folder endpoints.
     */
    public readonly folders = {
        /**
         * List folders in a project.
         */
        list: (projectId: string) => {
            return executeEndpoint(this.transport, listFolders, { projectId });
        },

        /**
         * Create a folder in a project.
         */
        create: (projectId: string, params: { name: string }) => {
            return executeEndpoint(this.transport, createFolder, { projectId, ...params });
        },

        /**
         * Update a folder.
         */
        update: (id: string, params: { name?: string }) => {
            return executeEndpoint(this.transport, updateFolder, { id, ...params });
        },

        /**
         * Delete a folder.
         */
        delete: (id: string) => {
            return executeEndpoint(this.transport, deleteFolder, { id });
        }
    };

    /**
     * File endpoints.
     */
    public readonly files = {
        /**
         * List files in a project.
         */
        list: (projectId: string) => {
            return executeEndpoint(this.transport, listFiles, { projectId });
        },

        /**
         * Retrieve a file by ID.
         */
        get: (id: string) => {
            return executeEndpoint(this.transport, getFile, { id });
        },

        /**
         * Start a multipart file upload.
         *
         * Prefer `files.upload` unless you need to manage upload parts yourself.
         */
        startMultipartUpload: (projectId: string, params: { name: string; size: number }) => {
            return executeEndpoint(this.transport, startMultipartUpload, { projectId, ...params });
        },

        /**
         * Complete a multipart file upload.
         *
         * Prefer `files.upload` unless you need to manage upload parts yourself.
         */
        completeUpload: (id: string, params: { parts: Array<{ partNumber: number; eTag: string }> }) => {
            return executeEndpoint(this.transport, completeUpload, { id, ...params });
        },

        /**
         * Upload a file from a path, Blob, Buffer, ArrayBuffer, or string.
         */
        upload: async (projectId: string, params: UploadFileParams): Promise<UploadFileResult> => {
            const source = await normalizeUploadSource(params);
            const upload = await this.files.startMultipartUpload(projectId, {
                name: params.name,
                size: source.size
            });
            const uploaded = await uploadMultipartParts({
                fetch: this.options.fetch,
                source,
                upload: upload.data
            });

            await this.files.completeUpload(uploaded.id, {
                parts: uploaded.parts
            });

            return { id: uploaded.id };
        },

        /**
         * Create a file from a YouTube URL.
         */
        uploadYoutube: (projectId: string, params: { url: string }) => {
            return executeEndpoint(this.transport, uploadYoutubeFile, { projectId, ...params });
        },

        /**
         * Update file metadata.
         */
        update: (id: string, params: { name?: string; description?: string | null; allowRestricted?: boolean }) => {
            return executeEndpoint(this.transport, updateFile, { id, ...params });
        },

        /**
         * Update a file tag.
         */
        updateTag: (id: string, params: { tag: FileTag }) => {
            return executeEndpoint(this.transport, updateFileTag, { id, ...params });
        },

        /**
         * Delete a file.
         */
        delete: (id: string) => {
            return executeEndpoint(this.transport, deleteFile, { id });
        }
    };

    /**
     * Comment endpoints.
     */
    public readonly comments = {
        /**
         * List comments for a file.
         */
        list: (fileId: string, params: { next?: string; prev?: string } = {}) => {
            return executeEndpoint(this.transport, listComments, { fileId, ...params });
        },

        /**
         * Create a comment or reply.
         */
        create: (fileId: string, params: { content: string; parentId?: string }) => {
            return executeEndpoint(this.transport, createComment, { fileId, ...params });
        },

        /**
         * List replies for a comment.
         */
        replies: (commentId: string, params: { next?: string; prev?: string } = {}) => {
            return executeEndpoint(this.transport, listReplies, { commentId, ...params });
        }
    };

    /**
     * Reaction endpoints.
     */
    public readonly reactions = {
        /**
         * List reactions for a comment.
         */
        list: (commentId: string) => {
            return executeEndpoint(this.transport, listReactions, { commentId });
        },

        /**
         * Create a reaction with a supported Unicode emoji.
         */
        create: (commentId: string, params: { type: string }) => {
            assertReactionEmoji(params.type);
            return executeEndpoint(this.transport, createReaction, { commentId, type: params.type });
        },

        /**
         * Delete a reaction with a supported Unicode emoji.
         */
        delete: (commentId: string, params: { type: string }) => {
            assertReactionEmoji(params.type);
            return executeEndpoint(this.transport, deleteReaction, { commentId, type: params.type });
        }
    };

    /**
     * Create a Youvico API client.
     */
    constructor(options: ClientOptions) {
        const resolvedOptions = resolveClientOptions(options);

        this.options = resolvedOptions;
        this.transport = createTransport(resolvedOptions);
    }
}
