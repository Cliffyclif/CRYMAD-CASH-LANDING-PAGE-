-- ═══════════════════════════════════════════════════════════════
-- CRYMAD CASH — DATABASE SCHEMA
-- Run on your Railway Postgres instance (or any Postgres ≥13)
--
-- This DB only stores what TygaBank does NOT provide:
--   • user passwords (TygaBank doesn't do password auth)
--   • email OTP codes (ephemeral)
--   • notifications (TygaBank has no notification API)
--   • saved beneficiaries (TygaBank has no beneficiary API)
--   • sessions / refresh tokens
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS citext;

-- ─── USERS ─────────────────────────────────────────────────────
-- Bridges Crymad Cash identity (email+password) to TygaBank user.
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT      UNIQUE NOT NULL,
  password_hash   TEXT,                                    -- nullable: OTP-only users
  tygapay_user_id TEXT        UNIQUE NOT NULL,              -- TygaBank user.id
  external_id     TEXT        UNIQUE NOT NULL,              -- TygaBank externalUserId
  account_type    TEXT        NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual','business')),
  -- Local email-verification flag. Primary source of truth — we own our own
  -- OTP lifecycle via Infomaniak because TygaBank's verify emails are unreliable.
  -- complete-registration will still fail at TygaBank until their flag is also flipped
  -- (pending admin-verify endpoint from their side).
  email_verified_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);
-- Additive migration for existing deployments:
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_tygapay ON users(tygapay_user_id);

-- CITEXT requires extension
CREATE EXTENSION IF NOT EXISTS citext;

-- ─── EMAIL OTP CODES ─────────────────────────────────────────────
-- For OTP-based login + email verification during registration.
CREATE TABLE IF NOT EXISTS email_otps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       CITEXT      NOT NULL,
  code_hash   TEXT        NOT NULL,                        -- bcrypt-hashed 6-digit code
  purpose     TEXT        NOT NULL CHECK (purpose IN ('login','register','email_verify')),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  attempts    INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON email_otps(email, purpose) WHERE used_at IS NULL;

-- ─── SESSIONS ─────────────────────────────────────────────────────
-- We use JWT for session tokens (see lib/auth/session.ts).
-- This table lets us revoke specific sessions.
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti           TEXT        UNIQUE NOT NULL,               -- JWT ID claim
  user_agent    TEXT,
  ip            INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT        NOT NULL,                       -- 'payout'|'card'|'kyc'|'security'|'system'|'crypto'
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  link        TEXT,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ─── BENEFICIARIES ────────────────────────────────────────────────
-- Saved bank accounts for fast withdrawals.
CREATE TABLE IF NOT EXISTS beneficiaries (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname        TEXT,
  full_name       TEXT        NOT NULL,
  bank_name       TEXT        NOT NULL,
  account_number  TEXT        NOT NULL,                   -- will be displayed masked
  swift_bic       TEXT,
  iban            TEXT,
  currency        TEXT        NOT NULL,
  country         TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_benef_user ON beneficiaries(user_id) WHERE is_active;

-- ─── updated_at triggers ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_benef_updated ON beneficiaries;
CREATE TRIGGER trg_benef_updated BEFORE UPDATE ON beneficiaries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
