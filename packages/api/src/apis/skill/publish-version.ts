import type { DataResponse, EndpointDefinition, PublishSkillVersionParams } from "../common";

export type Request = { id: string } & PublishSkillVersionParams;
export type Response = DataResponse<{ id: string; version: number }>;

export const publishSkillVersion: EndpointDefinition<Request, Response> = {
    method: "post",
    path: request => `/skills/${request.id}/versions`,
    bodyParams: ["content", "note", "isDefault"]
};
