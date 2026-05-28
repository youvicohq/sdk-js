import type { DataResponse, EndpointDefinition, SkillVersionMarkdown } from "../common";

export type Request = { id: string };
export type Response = DataResponse<SkillVersionMarkdown>;

export const getSkillVersion: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/skill-versions/${request.id}`
};
