import type { DataResponse, EndpointDefinition } from "../common";

export type Request = {
    fileId: string;
    content: string;
    parentId?: string;
};

export type Response = DataResponse<{ id: string }>;

export const createComment: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/files/${request.fileId}/comments`,
    bodyParams: ["content", "parentId"]
};
