import type { CreateSkillParams, DataResponse, EndpointDefinition } from "../common";

export type Request = CreateSkillParams;
export type Response = DataResponse<{ id: string }>;

export const createSkill: EndpointDefinition<Request, Response> = {
    method: "post",
    path: () => "/skills",
    bodyParams: ["name", "description", "metadata", "allowedTools", "license"]
};
