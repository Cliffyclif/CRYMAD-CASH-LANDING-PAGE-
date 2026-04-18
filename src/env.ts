import "dotenv/config";
import { z } from "zod";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";

// Also load root .env.local for monorepo-shared secrets
const rootEnvLocal = resolve(process.cwd(), "../../.env.local");
if (existsSync(rootEnvLocal)) {
  loadEnv({ path: rootEnvLocal });
}

// Helper: required if TYGAPAY_MODE matches, otherwise optional.
const str = () => z.string().optional();
const url = () => z.string().url().optional();

const envSchema = z.object({
  // ── Mode toggle ────────────────────────────────────────────────
  // Set to "prod" to use TYGAPAY_*_PROD vars, else sandbox.
  TYGAPAY_MODE: z.enum(["sandbox", "prod"]).default("sandbox"),

  // ── SANDBOX set ────────────────────────────────────────────────
  TYGAPAY_API_KEY_SANDBOX: str(),
  TYGAPAY_API_SECRET_SANDBOX: str(),
  TYGAPAY_TENANT_ID_SANDBOX: str(),
  TYGAPAY_USERS_URL_SANDBOX: url(),
  TYGAPAY_TRANSACTIONS_URL_SANDBOX: url(),
  TYGAPAY_ORDERS_URL_SANDBOX: url(),
  TYGAPAY_TENANTS_URL_SANDBOX: url(),
  TYGAPAY_CARDS_URL_SANDBOX: url(),
  TYGAPAY_CRYPTO_URL_SANDBOX: url(),
  TYGAPAY_AUTH_URL_SANDBOX: url(),
  TYGAPAY_REWARDS_URL_SANDBOX: url(),
  TYGAPAY_REPORTING_URL_SANDBOX: url(),

  // ── PROD set ───────────────────────────────────────────────────
  TYGAPAY_API_KEY_PROD: str(),
  TYGAPAY_API_SECRET_PROD: str(),
  TYGAPAY_TENANT_ID_PROD: str(),
  TYGAPAY_USERS_URL_PROD: url(),
  TYGAPAY_TRANSACTIONS_URL_PROD: url(),
  TYGAPAY_ORDERS_URL_PROD: url(),
  TYGAPAY_TENANTS_URL_PROD: url(),
  TYGAPAY_CARDS_URL_PROD: url(),
  TYGAPAY_CRYPTO_URL_PROD: url(),
  TYGAPAY_AUTH_URL_PROD: url(),
  TYGAPAY_REWARDS_URL_PROD: url(),
  TYGAPAY_REPORTING_URL_PROD: url(),

  // ── Legacy single-set vars (fallback for unprefixed values) ────
  // Lets us roll out gradually: if someone left the old TYGAPAY_API_KEY=...
  // in place, it still works for whichever mode is active and nothing is set.
  TYGAPAY_API_KEY: str(),
  TYGAPAY_API_SECRET: str(),
  TYGAPAY_TENANT_ID: str(),
  TYGAPAY_USERS_URL: url(),
  TYGAPAY_TRANSACTIONS_URL: url(),
  TYGAPAY_ORDERS_URL: url(),
  TYGAPAY_TENANTS_URL: url(),
  TYGAPAY_CARDS_URL: url(),
  TYGAPAY_CRYPTO_URL: url(),
  TYGAPAY_AUTH_URL: url(),
  TYGAPAY_REWARDS_URL: url(),
  TYGAPAY_REPORTING_URL: url(),

  // ── Core BFF vars ──────────────────────────────────────────────
  PORT: z.string().optional(),
  BFF_PORT: z.string().default("8787").transform(Number),
  BFF_SESSION_SECRET: z.string().min(16),
  BFF_DATABASE_URL: z.string().default("file:./data/crymad.db"),
  BFF_CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
  TYGA_PROXY_SECRET: z.string().min(16).optional(),
});

export const env = envSchema.parse(process.env);

// Resolve the active TygaBank config based on TYGAPAY_MODE with legacy fallback.
const mode = env.TYGAPAY_MODE;
const suffix = mode === "prod" ? "_PROD" : "_SANDBOX";

function pick(base: string): string {
  const modeVal = (env as Record<string, string | undefined>)[base + suffix];
  const legacyVal = (env as Record<string, string | undefined>)[base];
  const val = modeVal || legacyVal;
  if (!val) {
    throw new Error(
      `Missing TygaBank config: set ${base}${suffix} (or legacy ${base}) in env for TYGAPAY_MODE=${mode}`,
    );
  }
  return val;
}

export const tygaConfig = {
  mode,
  apiKey: pick("TYGAPAY_API_KEY"),
  apiSecret: pick("TYGAPAY_API_SECRET"),
  tenantId: pick("TYGAPAY_TENANT_ID"),
  urls: {
    users: pick("TYGAPAY_USERS_URL"),
    transactions: pick("TYGAPAY_TRANSACTIONS_URL"),
    orders: pick("TYGAPAY_ORDERS_URL"),
    tenants: pick("TYGAPAY_TENANTS_URL"),
    cards: pick("TYGAPAY_CARDS_URL"),
    crypto: pick("TYGAPAY_CRYPTO_URL"),
    auth: pick("TYGAPAY_AUTH_URL"),
    rewards: pick("TYGAPAY_REWARDS_URL"),
    reporting: pick("TYGAPAY_REPORTING_URL"),
  },
} as const;

console.log(`[bff] TygaBank mode: ${mode.toUpperCase()}`);
