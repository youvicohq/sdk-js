import type { EmptyResponse, EndpointDefinition, UpdateProjectParams } from "../common";

export type Request = { id: string } & UpdateProjectParams;
export type Response = EmptyResponse;

export const updateProject: EndpointDefinition<Request, Response> = {
    method: "patch",
    path: request => `/projects/${request.id}`,
    bodyParams: ["name", "description", "deadline", "accessRange"]
};
