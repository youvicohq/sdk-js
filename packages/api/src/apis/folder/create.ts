import type { DataResponse, EndpointDefinition } from "../common";

export type Request = {
    projectId: string;
    name: string;
};

export type Response = DataResponse<{ id: string }>;

export const createFolder: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/projects/${request.projectId}/folders`,
    bodyParams: ["name"]
};
