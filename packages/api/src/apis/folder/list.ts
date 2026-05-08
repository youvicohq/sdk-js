import type { EndpointDefinition, Folder, ListResponse } from "../common";

export type Request = { projectId: string };
export type Response = ListResponse<Folder>;

export const listFolders: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/projects/${request.projectId}/folders`
};
