import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import "./db.js"; // initialize schema
import { authRoutes } from "./routes/auth.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { walletRoutes } from "./routes/wallet.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { diagnosticsRoutes } from "./routes/diagnostics.js";
import { meRoutes } from "./routes/me.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.BFF_CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "bff", time: new Date().toISOString() }));

app.route("/auth", authRoutes);
app.route("/me", meRoutes);
app.route("/dashboard", dashboardRoutes);
app.route("/wallet", walletRoutes);
app.route("/webhooks", webhookRoutes);
app.route("/diagnostics", diagnosticsRoutes);

app.notFound((c) => c.json({ error: "not found", path: c.req.path }, 404));
app.onError((err, c) => {
  console.error("[bff error]", err);
  return c.json({ error: err.message ?? "internal error" }, 500);
});

const port = env.PORT ? Number(env.PORT) : env.BFF_PORT;
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`\n  🟢 Crymad BFF ready → http://localhost:${info.port}`);
  console.log(`     GET  /health`);
  console.log(`     POST /auth/login   {email}`);
  console.log(`     POST /auth/register {email, firstName, lastName}`);
  console.log(`     GET  /auth/me`);
  console.log(`     GET  /dashboard/summary`);
  console.log(`     GET  /wallet/balances`);
  console.log(`     POST /webhooks/tygapay\n`);
});
