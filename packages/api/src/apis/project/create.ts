import type { CreateProjectParams, DataResponse, EndpointDefinition } from "../common";

export type Request = CreateProjectParams;
export type Response = DataResponse<{ id: string }>;

export const createProject: EndpointDefinition<Request, Response> = {
    method: "post",
    path: () => "/projects",
    bodyParams: ["name", "deadline", "description", "members", "accessRange"]
};
