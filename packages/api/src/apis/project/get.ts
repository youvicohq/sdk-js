import type { DataResponse, EndpointDefinition, Project } from "../common";

export type Request = { id: string };
export type Response = DataResponse<Project>;

export const getProject: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/projects/${request.id}`
};
