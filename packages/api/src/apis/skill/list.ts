import type { EndpointDefinition, ListResponse, SkillSummary } from "../common";

export type Request = Record<string, never>;
export type Response = ListResponse<SkillSummary>;

export const listSkills: EndpointDefinition<Request, Response> = {
    method: "get",
    path: () => "/skills"
};
