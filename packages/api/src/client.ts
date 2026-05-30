import { assertReactionEmoji } from "./apis/emoji";
import { createComment, deleteComment, listComments, listReplies, updateComment } from "./apis/comment";
import type {
    CreateProjectParams,
    CreateSkillParams,
    FileTag,
    PublishSkillVersionParams,
    UpdateProjectParams,
    UpdateSkillParams,
    UploadFileParams,
    UploadFileResult
} from "./apis/common";
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
import {
    cancelProjectDeletion,
    createProject,
    getProject,
    scheduleProjectDeletion,
    searchProject,
    type SearchProjectsRequest,
    updateProject
} from "./apis/project";
import { createReaction, deleteReaction, listReactions } from "./apis/reaction";
import { createSkill, deleteSkill, getSkill, listSkills, publishSkillVersion, updateSkill } from "./apis/skill";
import { deleteSkillVersion, getSkillVersion } from "./apis/skill-version";
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
         * Create a project in the workspace associated with the API key.
         */
        create: (params: CreateProjectParams) => {
            return executeEndpoint(this.transport, createProject, params);
        },

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
        },

        /**
         * Update project metadata.
         */
        update: (id: string, params: UpdateProjectParams) => {
            return executeEndpoint(this.transport, updateProject, { id, ...params });
        },

        /**
         * Schedule a project for deletion.
         */
        scheduleDeletion: (id: string) => {
            return executeEndpoint(this.transport, scheduleProjectDeletion, { id });
        },

        /**
         * Cancel a scheduled project deletion.
         */
        cancelDeletion: (id: string) => {
            return executeEndpoint(this.transport, cancelProjectDeletion, { id });
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
        update: (id: string, params: { name?: string; description?: string | null; allowRestricted?: boolean; folder?: { id: string } | null }) => {
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
        create: (
            fileId: string,
            params: {
                content: string;
                anchor?: number;
                duration?: number;
                parent?: { id: string };
                /**
                 * @deprecated Use parent.id.
                 */
                parentId?: string;
            }
        ) => {
            return executeEndpoint(this.transport, createComment, { fileId, ...params });
        },

        /**
         * Update a comment owned by the API key actor.
         */
        update: (id: string, params: { content: string }) => {
            return executeEndpoint(this.transport, updateComment, { id, ...params });
        },

        /**
         * Delete a comment owned by the API key actor.
         */
        delete: (id: string) => {
            return executeEndpoint(this.transport, deleteComment, { id });
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
     * Skill endpoints.
     */
    public readonly skills = {
        /**
         * List skills available to the configured API key.
         */
        list: () => {
            return executeEndpoint(this.transport, listSkills, {});
        },

        /**
         * Create a workspace skill.
         */
        create: (params: CreateSkillParams) => {
            return executeEndpoint(this.transport, createSkill, params);
        },

        /**
         * Retrieve a skill by ID.
         */
        get: (id: string) => {
            return executeEndpoint(this.transport, getSkill, { id });
        },

        /**
         * Update a workspace skill.
         */
        update: (id: string, params: UpdateSkillParams) => {
            return executeEndpoint(this.transport, updateSkill, { id, ...params });
        },

        /**
         * Delete a workspace skill.
         */
        delete: (id: string) => {
            return executeEndpoint(this.transport, deleteSkill, { id });
        },

        /**
         * Publish a new skill version.
         */
        publishVersion: (id: string, params: PublishSkillVersionParams) => {
            return executeEndpoint(this.transport, publishSkillVersion, { id, ...params });
        }
    };

    /**
     * Skill version endpoints.
     */
    public readonly skillVersions = {
        /**
         * Retrieve rendered markdown for a skill version.
         */
        get: (id: string) => {
            return executeEndpoint(this.transport, getSkillVersion, { id });
        },

        /**
         * Delete a non-default workspace skill version.
         */
        delete: (id: string) => {
            return executeEndpoint(this.transport, deleteSkillVersion, { id });
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
