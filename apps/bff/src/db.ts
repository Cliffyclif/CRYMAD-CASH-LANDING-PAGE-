import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { env } from "./env.js";

const dbPath = env.BFF_DATABASE_URL.replace(/^file:/, "");
const dir = dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize schema (dev-only quick bootstrap; prod would use drizzle-kit migrations)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tyga_client_token TEXT,
    email TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

  CREATE TABLE IF NOT EXISTS beneficiaries (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    linked_user_id TEXT,
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    address TEXT,
    currency TEXT,
    kind TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_ben_owner ON beneficiaries(owner_user_id);

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    read_at INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS notification_prefs (
    user_id TEXT PRIMARY KEY,
    email INTEGER NOT NULL DEFAULT 1,
    push INTEGER NOT NULL DEFAULT 1,
    sms INTEGER NOT NULL DEFAULT 0,
    categories TEXT
  );

  CREATE TABLE IF NOT EXISTS team_roles (
    user_id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    permissions TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS counterparty_limits (
    id TEXT PRIMARY KEY,
    counterparty_id TEXT NOT NULL,
    daily_limit REAL NOT NULL,
    monthly_limit REAL,
    exposure REAL NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at DESC);

  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    processed_at INTEGER,
    received_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recurring_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tyga_recurring_id TEXT,
    nickname TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    frequency TEXT NOT NULL,
    next_run_at INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  );
`);
