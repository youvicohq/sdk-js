import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = {
    id: string;
    name?: string;
    description?: string | null;
    allowRestricted?: boolean;
};

export type Response = EmptyResponse;

export const updateFile: EndpointDefinition<Request, Response> = {
    method: "patch",
    path: request => `/files/${request.id}`,
    bodyParams: ["name", "description", "allowRestricted"]
};
