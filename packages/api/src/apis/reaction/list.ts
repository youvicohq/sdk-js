import type { EndpointDefinition, ListResponse, Reaction } from "../common";

export type Request = { commentId: string };
export type Response = ListResponse<Reaction>;

export const listReactions: EndpointDefinition<Request, Response> = {
    method: "get",
    path: request => `/comments/${request.commentId}/reactions`
};
