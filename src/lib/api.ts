/**
 * Dashboard API client. All calls go to the same-origin /api proxy configured
 * in vite.config.ts (dev) or the dashboard host (prod build via VITE_API_BASE).
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
  }
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal } = opts;
  let url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const text = await res.text();
  let data: unknown = text;
  try { data = text ? JSON.parse(text) : null; } catch { /* keep as text */ }
  if (!res.ok) {
    const msg = (data && typeof data === "object" && data !== null && "error" in data)
      ? String((data as { error: unknown }).error)
      : res.statusText;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}
