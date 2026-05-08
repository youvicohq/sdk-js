export type QueryValue = string | number | boolean | null | undefined | QueryObject;
export type QueryObject = { [key: string]: QueryValue };

export function serializeQuery(query?: QueryObject): string {
    if (!query) {
        return "";
    }

    const params = new URLSearchParams();
    appendQuery(params, query);
    const value = params.toString();

    return value ? `?${value}` : "";
}

function appendQuery(params: URLSearchParams, value: QueryObject, prefix?: string) {
    for (const [key, item] of Object.entries(value)) {
        if (item === undefined || item === null) {
            continue;
        }

        const name = prefix ? `${prefix}.${key}` : key;

        if (typeof item === "object") {
            appendQuery(params, item, name);
            continue;
        }

        params.set(name, String(item));
    }
}
