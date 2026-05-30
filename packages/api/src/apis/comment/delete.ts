import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = { id: string };
export type Response = EmptyResponse;

export const deleteComment: EndpointDefinition<Request, Response> = {
    method: "delete",
    path: request => `/comments/${request.id}`
};
