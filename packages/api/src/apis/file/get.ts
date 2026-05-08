import type { DataResponse, EndpointDefinition, FileDetails } from "../common";

export type Request = { id: string };
export type Response = DataResponse<FileDetails>;

export const getFile: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/files/${request.id}`
};
