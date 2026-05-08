import type { CompleteUploadPart, EmptyResponse, EndpointDefinition } from "../common";

export type Request = {
    id: string;
    parts: CompleteUploadPart[];
};

export type Response = EmptyResponse;

export const completeUpload: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/files/${request.id}/upload.complete`,
    bodyParams: ["parts"]
};
