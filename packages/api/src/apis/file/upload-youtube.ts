import type { DataResponse, EndpointDefinition } from "../common";

export type Request = {
    projectId: string;
    url: string;
};

export type Response = DataResponse<{ id: string }>;

export const uploadYoutubeFile: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/projects/${request.projectId}/files/upload.youtube`,
    bodyParams: ["url"]
};
