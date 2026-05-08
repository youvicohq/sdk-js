import type { Comment, CursorPaginatedResponse, EndpointDefinition } from "../common";

export type Request = {
    fileId: string;
    next?: string;
    prev?: string;
};

export type Response = CursorPaginatedResponse<Comment>;

export const listComments: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/files/${request.fileId}/comments`,
    queryParams: ["next", "prev"]
};
