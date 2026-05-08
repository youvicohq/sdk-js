import type { EmptyResponse, EndpointDefinition, FileTag } from "../common";

export type Request = {
    id: string;
    tag: FileTag;
};

export type Response = EmptyResponse;

export const updateFileTag: EndpointDefinition<Request, Response> = {
    method: "patch",
    path: request => `/files/${request.id}/tag`,
    bodyParams: ["tag"]
};
