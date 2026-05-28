import type { DataResponse, EndpointDefinition, SkillDetail } from "../common";

export type Request = { id: string };
export type Response = DataResponse<SkillDetail>;

export const getSkill: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/skills/${request.id}`
};
