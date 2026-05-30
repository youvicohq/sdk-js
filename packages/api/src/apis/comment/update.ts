import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = {
    id: string;
    content: string;
};

export type Response = EmptyResponse;

export const updateComment: EndpointDefinition<Request, Response> = {
    method: "patch",
    path: request => `/comments/${request.id}`,
    bodyParams: ["content"]
};
