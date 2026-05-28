import type { EmptyResponse, EndpointDefinition, UpdateSkillParams } from "../common";

export type Request = { id: string } & UpdateSkillParams;
export type Response = EmptyResponse;

export const updateSkill: EndpointDefinition<Request, Response> = {
    method: "patch",
    path: request => `/skills/${request.id}`,
    bodyParams: ["name", "description", "metadata", "allowedTools", "license", "default"]
};
