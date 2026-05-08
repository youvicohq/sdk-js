import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = { id: string };
export type Response = EmptyResponse;

export const deleteFolder: EndpointDefinition<Request, Response> = {
    method: "delete",
    path: request => `/folders/${request.id}`
};
