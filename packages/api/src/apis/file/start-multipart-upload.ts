import type { DataResponse, EndpointDefinition, MultipartUpload } from "../common";

export type Request = {
    projectId: string;
    name: string;
    size: number;
};

export type Response = DataResponse<MultipartUpload>;

export const startMultipartUpload: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/projects/${request.projectId}/files/upload.multipart`,
    bodyParams: ["name", "size"]
};
