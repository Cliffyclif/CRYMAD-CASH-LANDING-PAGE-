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

const envSchema = z.object({
  TYGAPAY_API_KEY: z.string().min(1),
  TYGAPAY_API_SECRET: z.string().min(1),
  TYGAPAY_TENANT_ID: z.string().min(1),
  TYGAPAY_USERS_URL: z.string().url(),
  TYGAPAY_TRANSACTIONS_URL: z.string().url(),
  TYGAPAY_ORDERS_URL: z.string().url(),
  TYGAPAY_TENANTS_URL: z.string().url(),
  TYGAPAY_CARDS_URL: z.string().url(),
  TYGAPAY_CRYPTO_URL: z.string().url(),
  TYGAPAY_AUTH_URL: z.string().url(),
  TYGAPAY_REWARDS_URL: z.string().url(),
  TYGAPAY_REPORTING_URL: z.string().url(),
  BFF_PORT: z.string().default("8787").transform(Number),
  BFF_SESSION_SECRET: z.string().min(16),
  BFF_DATABASE_URL: z.string().default("file:./data/crymad.db"),
  BFF_CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
});

export const env = envSchema.parse(process.env);

export const tygaConfig = {
  apiKey: env.TYGAPAY_API_KEY,
  apiSecret: env.TYGAPAY_API_SECRET,
  tenantId: env.TYGAPAY_TENANT_ID,
  urls: {
    users: env.TYGAPAY_USERS_URL,
    transactions: env.TYGAPAY_TRANSACTIONS_URL,
    orders: env.TYGAPAY_ORDERS_URL,
    tenants: env.TYGAPAY_TENANTS_URL,
    cards: env.TYGAPAY_CARDS_URL,
    crypto: env.TYGAPAY_CRYPTO_URL,
    auth: env.TYGAPAY_AUTH_URL,
    rewards: env.TYGAPAY_REWARDS_URL,
    reporting: env.TYGAPAY_REPORTING_URL,
  },
} as const;
