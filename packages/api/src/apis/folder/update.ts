import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = {
    id: string;
    name?: string;
};

export type Response = EmptyResponse;

export const updateFolder: EndpointDefinition<Request, Response> = {
    method: "patch",
    path: request => `/folders/${request.id}`,
    bodyParams: ["name"]
};
