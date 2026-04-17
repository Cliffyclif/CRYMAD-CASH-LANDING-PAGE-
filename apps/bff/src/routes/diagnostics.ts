import { Hono } from "hono";
import { tyga } from "../tyga.js";
import { requireSession, type SessionPayload } from "../session.js";

/**
 * Diagnostic probe — tries every candidate TygaPay endpoint with the fixed HMAC signer
 * and reports which paths actually work on the current sandbox tenant. Dev-only.
 */
export const diagnosticsRoutes = new Hono<{ Variables: { session: SessionPayload } }>();
diagnosticsRoutes.use("*", requireSession);

interface ProbeResult {
  service: string;
  method: string;
  path: string;
  status: "ok" | "error";
  httpStatus?: number;
  errorMessage?: string;
  sample?: unknown;
}

async function probe(
  service: Parameters<typeof tyga.request>[0]["service"],
  method: "GET" | "POST",
  path: string,
  opts: { query?: Record<string, string | number>; body?: Record<string, unknown> } = {},
): Promise<ProbeResult> {
  try {
    const res = await tyga.request({ service, method, path, ...opts });
    return {
      service,
      method,
      path,
      status: "ok",
      httpStatus: 200,
      sample: typeof res === "object" && res ? Object.keys(res).slice(0, 6) : res,
    };
  } catch (err) {
    const e = err as { status?: number; message?: string; raw?: unknown };
    let short: string | undefined;
    if (typeof e.raw === "string") {
      const m = e.raw.match(/<pre>([^<]+)<\/pre>/);
      short = m?.[1] ?? e.raw.slice(0, 120);
    } else if (e.raw && typeof e.raw === "object") {
      short = JSON.stringify(e.raw).slice(0, 200);
    }
    return {
      service,
      method,
      path,
      status: "error",
      httpStatus: e.status,
      errorMessage: short ?? e.message,
    };
  }
}

diagnosticsRoutes.get("/probe", async (c) => {
  const { userId } = c.get("session");
  const results: ProbeResult[] = [];

  // USERS
  results.push(await probe("users", "GET", "/user", { query: { userId } }));
  results.push(await probe("users", "GET", `/user/${userId}`));
  results.push(await probe("users", "GET", `/user/${userId}/wallet`));
  results.push(await probe("users", "GET", `/user/${userId}/crypto/deposit-addresses`));
  results.push(await probe("users", "POST", "/user/exists", { body: { userId } }));

  // TENANTS
  results.push(await probe("tenants", "GET", "/api-tenants/wallets"));
  results.push(await probe("tenants", "GET", "/api-tenants/users/total-balances"));
  results.push(await probe("tenants", "GET", "/wallets"));
  results.push(await probe("tenants", "GET", "/users/total-balances"));

  // TRANSACTIONS
  results.push(await probe("transactions", "GET", "/transactions/users", { query: { userId } }));
  results.push(await probe("transactions", "GET", "/transactions", { query: { userId } }));

  // CARDS
  results.push(await probe("cards", "GET", `/account/${userId}`));
  results.push(await probe("cards", "GET", `/account/${userId}/kyc-status`));
  results.push(await probe("cards", "GET", "/fees"));
  results.push(await probe("cards", "GET", "/fees/v2"));
  results.push(await probe("cards", "GET", "/health"));

  // CRYPTO
  results.push(await probe("crypto", "GET", "/health"));
  results.push(await probe("crypto", "GET", `/wallets/custodial/${userId}`));

  // ORDERS
  results.push(await probe("orders", "GET", "/"));

  // REPORTING
  const today = new Date().toISOString().slice(0, 10);
  const lastMonth = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  results.push(
    await probe("reporting", "GET", "/transactions/users", {
      query: { startDate: lastMonth, endDate: today, userIds: userId },
    }),
  );
  results.push(
    await probe("reporting", "GET", "/transactions/tenant", {
      query: { startDate: lastMonth, endDate: today },
    }),
  );

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === "ok").length,
    errors: results.filter((r) => r.status === "error").length,
  };

  return c.json({ summary, results });
});
