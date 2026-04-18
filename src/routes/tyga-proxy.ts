import { Hono } from "hono";
import { env } from "../env.js";
import { tyga } from "../tyga.js";
import type { ServiceName } from "../tyga-client/types.js";

const VALID_SERVICES: ServiceName[] = [
  "users",
  "auth",
  "orders",
  "rewards",
  "reporting",
  "transactions",
  "cards",
  "crypto",
  "tenants",
];

export const tygaProxyRoutes = new Hono();

tygaProxyRoutes.all("/:service/*", async (c) => {
  const providedSecret = c.req.header("x-internal-secret");
  if (!env.TYGA_PROXY_SECRET || providedSecret !== env.TYGA_PROXY_SECRET) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const service = c.req.param("service") as ServiceName;
  if (!VALID_SERVICES.includes(service)) {
    return c.json({ error: "invalid_service", service }, 400);
  }

  const prefix = `/tyga/${service}`;
  const fullPath = new URL(c.req.url).pathname;
  const tygaPath = fullPath.slice(prefix.length) || "/";

  const query: Record<string, string> = {};
  for (const [k, v] of new URL(c.req.url).searchParams.entries()) {
    query[k] = v;
  }

  const method = c.req.method.toUpperCase() as "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  const hasBody = method !== "GET" && method !== "DELETE";
  let body: Record<string, unknown> | undefined;
  if (hasBody) {
    const text = await c.req.text();
    if (text) {
      try { body = JSON.parse(text); } catch { body = undefined; }
    }
    if (!body) body = {};
  }

  try {
    const data = await tyga.request({
      service,
      method,
      path: tygaPath,
      query: Object.keys(query).length ? query : undefined,
      body,
    });
    return c.json({ ok: true, data });
  } catch (err) {
    const e = err as { status?: number; message?: string; raw?: unknown };
    return c.json(
      { ok: false, error: e.message || "tyga_error", status: e.status, raw: e.raw },
      { status: (e.status && e.status >= 400 && e.status < 600 ? e.status : 502) as 400 | 401 | 403 | 404 | 500 | 502 },
    );
  }
});
