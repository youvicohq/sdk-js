import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = { id: string };
export type Response = EmptyResponse;

export const cancelProjectDeletion: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/projects/${request.id}/delete.cancel`
};
