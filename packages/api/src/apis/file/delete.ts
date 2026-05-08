import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = { id: string };
export type Response = EmptyResponse;

export const deleteFile: EndpointDefinition<Request, Response> = {
    method: "delete",
    path: request => `/files/${request.id}`
};
