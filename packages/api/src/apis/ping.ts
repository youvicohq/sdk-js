import type { DataResponse, EndpointDefinition, PingResult } from "./common";

export type Request = Record<string, never>;
export type Response = DataResponse<PingResult>;

export const pingApi: EndpointDefinition<Request, Response> = {
    method: "get",
    path: () => "/ping"
};
