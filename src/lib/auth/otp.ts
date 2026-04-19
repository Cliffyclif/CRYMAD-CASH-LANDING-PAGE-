/**
 * Email OTP generation + verification.
 * Codes are 6 digits, bcrypt-hashed at rest, valid for 10 minutes,
 * max 5 verification attempts.
 */

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { query, queryOne } from "@/lib/db";

const TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export type OtpPurpose = "login" | "register" | "email_verify" | "reset";

export function generateCode(): string {
  // 6-digit numeric, crypto-strong
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

export async function createOtp(email: string, purpose: OtpPurpose): Promise<string> {
  const code = generateCode();
  const hash = await bcrypt.hash(code, 10);
  // Invalidate any existing unused OTPs for this email/purpose
  await query(
    `UPDATE email_otps SET used_at = NOW() WHERE email = $1 AND purpose = $2 AND used_at IS NULL`,
    [email.toLowerCase(), purpose],
  );
  await query(
    `INSERT INTO email_otps(email, code_hash, purpose, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '${TTL_MINUTES} minutes')`,
    [email.toLowerCase(), hash, purpose],
  );
  return code;
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose): Promise<boolean> {
  const row = await queryOne<{
    id: string;
    code_hash: string;
    attempts: number;
    expires_at: Date;
  }>(
    `SELECT id, code_hash, attempts, expires_at FROM email_otps
       WHERE email = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
    [email.toLowerCase(), purpose],
  );
  if (!row) return false;
  if (row.attempts >= MAX_ATTEMPTS) return false;

  const ok = await bcrypt.compare(code, row.code_hash);
  if (!ok) {
    await query(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
    return false;
  }
  // Mark used
  await query(`UPDATE email_otps SET used_at = NOW() WHERE id = $1`, [row.id]);
  return true;
}
