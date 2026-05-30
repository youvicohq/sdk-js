export type Method = "get" | "post" | "patch" | "delete";

export type EndpointDefinition<Request, Response> = {
    method: Method;
    path: (request: Request) => string;
    queryParams?: readonly (keyof Request & string)[];
    bodyParams?: readonly (keyof Request & string)[];
    response?: Response;
};

/**
 * Response shape for endpoints that return a single resource.
 */
export type DataResponse<T> = { data: T };

/**
 * Response shape for endpoints that return a list of resources.
 */
export type ListResponse<T> = { data: T[] };

/**
 * Offset pagination metadata.
 */
export type OffsetPage = {
    /**
     * Current page number.
     */
    current: number;

    /**
     * Whether another page is available.
     */
    hasNext: boolean;
};

/**
 * Cursor pagination metadata.
 */
export type CursorPage = {
    /**
     * Cursor for the next page.
     */
    next: string | null;

    /**
     * Cursor for the previous page.
     */
    prev: string | null;
};

/**
 * Response shape for offset-paginated resources.
 */
export type OffsetPaginatedResponse<T> = { data: T[]; page: OffsetPage };

/**
 * Response shape for cursor-paginated resources.
 */
export type CursorPaginatedResponse<T> = { data: T[]; page: CursorPage };

export type EmptyResponse = void;

/**
 * Workspace information returned by the API ping endpoint.
 */
export type PingWorkspace = {
    /**
     * Workspace ID.
     */
    id: string;

    /**
     * Workspace name.
     */
    name: string;

    /**
     * Public workspace avatar URL.
     */
    avatarUrl: string | null;
};

/**
 * Result returned by the API ping endpoint.
 */
export type PingResult = {
    /**
     * Whether the API key is valid and reachable.
     */
    PONG: true;

    /**
     * Workspace associated with the API key.
     */
    workspace: PingWorkspace;
};

/**
 * Youvico project.
 */
export type Project = {
    /**
     * Project ID.
     */
    id: string;

    /**
     * Project name.
     */
    name: string;

    /**
     * Project description.
     */
    description: string | null;

    /**
     * Project thumbnail URL.
     */
    thumbnail: string | null;

    /**
     * ISO timestamp for when the project was created.
     */
    createdAt: string;

    /**
     * ISO timestamp for when the project was last updated.
     */
    updatedAt: string;

    /**
     * ISO timestamp for when the project is scheduled for deletion.
     */
    destroyedAt?: string | null;
};

/**
 * Project access policy.
 */
export type ProjectAccessRange = "ONLY_PROJECT_MEMBER" | "ALLOW_WORKSPACE_MEMBER";

/**
 * Project member role accepted by public project creation.
 */
export type ProjectRole =
    | "PROJECT_MANAGER" |
    "PROJECT_MEMBER" |
    "PROJECT_REVIEWER" |
    "PROJECT_RESTRICTED_REVIEWER";

/**
 * Parameters for creating a project.
 */
export type CreateProjectParams = {
    /**
     * Project name.
     */
    name: string;

    /**
     * Deadline date in YYYY-MM-DD format.
     */
    deadline: string;

    /**
     * Project description.
     */
    description?: string;

    /**
     * Members to add to the project.
     */
    members: Array<{
        user: { id: string };
        role: ProjectRole;
    }>;

    /**
     * Project access policy.
     */
    accessRange: ProjectAccessRange;
};

/**
 * Parameters for updating a project.
 */
export type UpdateProjectParams = {
    /**
     * Project name.
     */
    name?: string;

    /**
     * Project description. Pass null to clear it.
     */
    description?: string | null;

    /**
     * Deadline date in YYYY-MM-DD format.
     */
    deadline?: string;

    /**
     * Project access policy.
     */
    accessRange?: ProjectAccessRange;
};

/**
 * Folder in a project.
 */
export type Folder = {
    /**
     * Folder ID.
     */
    id: string;

    /**
     * Folder name.
     */
    name: string;
};

/**
 * File source mode.
 */
export type FileMode = "LOCAL" | "YOUTUBE";

/**
 * File processing status.
 */
export type FileStatus = "UPLOADING" | "UPLOADED" | "FAILED";

/**
 * Review workflow tag assigned to a file.
 */
export type FileTag =
    | "IN_PROGRESS" |
    "NEED_REVIEW" |
    "NEED_EDIT" |
    "ON_HOLD" |
    "APPROVED" |
    "REJECTED" |
    "CLOSED";

/**
 * Youvico file.
 */
export type File = {
    /**
     * File ID.
     */
    id: string;

    /**
     * File name.
     */
    name: string;

    /**
     * File description.
     */
    description: string | null;

    /**
     * File source mode.
     */
    mode: FileMode;

    /**
     * MIME type reported for the file.
     */
    mimeType: string | null;

    /**
     * File processing status.
     */
    status: FileStatus;

    /**
     * Review workflow tag assigned to the file.
     */
    tag: FileTag;

    /**
     * File size in bytes.
     */
    size: number;

    /**
     * Whether restricted users can access the file.
     */
    allowRestricted: boolean;

    /**
     * Sort order within the project.
     */
    order: number;

    /**
     * Folder containing the file.
     */
    folder: { id: string } | null;
};

/**
 * Detailed file response.
 */
export type FileDetails = File & {
    /**
     * Project containing the file.
     */
    project: { id: string };
};

/**
 * Author of a comment.
 */
export type CommentAuthor = {
    /**
     * User ID.
     */
    id: string;

    /**
     * Display name.
     */
    name: string;

    /**
     * Avatar image URL.
     */
    avatarUrl: string | null;
};

/**
 * Comment on a file.
 */
export type Comment = {
    /**
     * Comment ID.
     */
    id: string;

    /**
     * Comment content.
     */
    content: string | null;

    /**
     * Video timestamp in milliseconds, or page number starting from 1 for documents.
     */
    anchor: number | null;

    /**
     * Duration in the same unit as anchor.
     */
    duration: number | null;

    /**
     * ISO timestamp for when the comment was created.
     */
    createdAt: string;

    /**
     * ISO timestamp for when the comment was last updated.
     */
    updatedAt: string;

    /**
     * Comment author.
     */
    author: CommentAuthor | null;
};

/**
 * Aggregated reaction for a comment.
 */
export type Reaction = {
    /**
     * Unicode emoji used for the reaction.
     */
    type: string;

    /**
     * Number of users who reacted with this emoji.
     */
    count: number;

    /**
     * Users who reacted with this emoji.
     */
    users: Array<{ id: string }>;
};

/**
 * Source that owns a skill.
 */
export type SkillSource = "WORKSPACE" | "YOUVICO_MANAGED";

/**
 * Skill metadata returned in list responses.
 */
export type SkillSummary = {
    /**
     * Skill ID.
     */
    id: string;

    /**
     * Source that owns the skill.
     */
    source: SkillSource;

    /**
     * Skill name.
     */
    name: string;

    /**
     * Skill description.
     */
    description: string;
};

/**
 * Version metadata embedded in skill detail responses.
 */
export type SkillVersionSummary = {
    /**
     * Skill version ID.
     */
    id: string;

    /**
     * Monotonic version number for the skill.
     */
    version: number;

    /**
     * Optional note attached when the version was published.
     */
    note: string | null;

    /**
     * ISO timestamp for when the version was created.
     */
    createdAt: string;
};

/**
 * Detailed skill response.
 */
export type SkillDetail = SkillSummary & {
    /**
     * User-defined metadata for the skill.
     */
    metadata: Record<string, string> | null;

    /**
     * Tool identifiers allowed for the skill.
     */
    allowedTools: string[] | null;

    /**
     * Skill license.
     */
    license: string | null;

    /**
     * Default version for the skill.
     */
    default: { id: string } | null;

    /**
     * Published versions for the skill.
     */
    versions: SkillVersionSummary[];
};

/**
 * Markdown snapshot returned for a skill version.
 */
export type SkillVersionMarkdown = {
    /**
     * Rendered skill markdown.
     */
    markdown: string;
};

/**
 * Parameters for creating a skill.
 */
export type CreateSkillParams = {
    /**
     * Skill name.
     */
    name: string;

    /**
     * Skill description.
     */
    description: string;

    /**
     * User-defined string metadata.
     */
    metadata?: Record<string, string>;

    /**
     * Tool identifiers allowed for the skill.
     */
    allowedTools?: string[];

    /**
     * Skill license.
     */
    license?: string;
};

/**
 * Parameters for updating a skill.
 */
export type UpdateSkillParams = {
    /**
     * Skill name.
     */
    name?: string;

    /**
     * Skill description.
     */
    description?: string;

    /**
     * User-defined string metadata.
     */
    metadata?: Record<string, string> | null;

    /**
     * Tool identifiers allowed for the skill.
     */
    allowedTools?: string[] | null;

    /**
     * Skill license.
     */
    license?: string | null;

    /**
     * Default version for the skill.
     */
    default?: { id: string };
};

/**
 * Parameters for publishing a skill version.
 */
export type PublishSkillVersionParams = {
    /**
     * Markdown content for the version.
     */
    content: string;

    /**
     * Optional note for tracking the published version.
     */
    note?: string;

    /**
     * Whether the new version should become the default version.
     */
    isDefault?: boolean;
};

/**
 * Multipart upload session.
 */
export type MultipartUpload = {
    /**
     * Upload ID.
     */
    id: string;

    /**
     * Pre-signed upload URLs for each part.
     */
    parts: Array<{
        /**
         * Part number to upload.
         */
        partNumber: number;

        /**
         * Pre-signed URL for the part upload.
         */
        url: string;
    }>;
};

/**
 * Uploaded multipart part used to complete an upload.
 */
export type CompleteUploadPart = {
    /**
     * Uploaded part number.
     */
    partNumber: number;

    /**
     * Entity tag returned by the part upload response.
     */
    eTag: string;
};

/**
 * Supported data sources for SDK-managed file uploads.
 */
export type UploadData = Blob | ArrayBuffer | Uint8Array | string;

/**
 * Parameters for uploading a file with SDK-managed multipart upload.
 */
export type UploadFileParams = {
    /**
     * File name to create in Youvico.
     */
    name: string;

    /**
     * Local file path to upload.
     */
    path?: string;

    /**
     * In-memory data to upload.
     */
    data?: UploadData;
};

/**
 * Result returned after an SDK-managed upload completes.
 */
export type UploadFileResult = {
    /**
     * Created file ID.
     */
    id: string;
};
