import type { EndpointDefinition, OffsetPaginatedResponse, Project } from "../common";

export type Request = {
    query: string;
    page?: number;
    sort?: {
        type?: "name" | "createdAt";
        direction?: "asc" | "desc";
    };
};

export type Response = OffsetPaginatedResponse<Project>;

export const searchProject: EndpointDefinition<Request, Response> = {
    method: "get",
    path: () => "/projects/search",
    queryParams: ["query", "page", "sort"]
};
