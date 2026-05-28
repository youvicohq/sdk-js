import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = { id: string };
export type Response = EmptyResponse;

export const deleteSkillVersion: EndpointDefinition<Request, Response> = {
    method: "delete",
    path: request => `/skill-versions/${request.id}`
};
