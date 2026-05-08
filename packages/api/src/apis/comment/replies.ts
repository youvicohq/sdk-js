import type { Comment, CursorPaginatedResponse, EndpointDefinition } from "../common";

export type Request = {
    commentId: string;
    next?: string;
    prev?: string;
};

export type Response = CursorPaginatedResponse<Comment>;

export const listReplies: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/comments/${request.commentId}/replies`,
    queryParams: ["next", "prev"]
};
