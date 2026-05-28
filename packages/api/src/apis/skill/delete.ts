import type { EmptyResponse, EndpointDefinition } from "../common";

export type Request = { id: string };
export type Response = EmptyResponse;

export const deleteSkill: EndpointDefinition<Request, Response> = {
    method: "delete",
    path: request => `/skills/${request.id}`
};
