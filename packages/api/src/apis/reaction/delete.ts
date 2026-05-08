import type { EmptyResponse, EndpointDefinition } from "../common";
import type { ReactionEmoji } from "../emoji";

export type Request = {
    commentId: string;
    type: ReactionEmoji;
};

export type Response = EmptyResponse;

export const deleteReaction: EndpointDefinition<Request, Response> = {
    method: "delete",
    path: request => `/comments/${request.commentId}/reactions`,
    bodyParams: ["type"]
};
