const BFF_URL = import.meta.env.VITE_BFF_URL ?? "http://localhost:8787";
export class ApiError extends Error {
    status;
    data;
    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}
export async function api(path, init = {}) {
    const res = await fetch(`${BFF_URL}${path}`, {
        credentials: "include",
        ...init,
        headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    });
    const text = await res.text();
    const data = text ? (() => { try {
        return JSON.parse(text);
    }
    catch {
        return text;
    } })() : undefined;
    if (!res.ok) {
        const msg = (data && typeof data === "object" && "error" in data)
            ? String(data.error)
            : res.statusText;
        throw new ApiError(res.status, msg, data);
    }
    return data;
}
