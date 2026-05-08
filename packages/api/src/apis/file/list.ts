import type { EndpointDefinition, File, ListResponse } from "../common";

export type Request = { projectId: string };
export type Response = ListResponse<File>;

export const listFiles: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/projects/${request.projectId}/files`
};
