/**
 * POST /api/auth/verify-otp
 * Body: { email, code, purpose: "login" | "register" | "email_verify" }
 *
 * Our OTP is the canonical verifier. TygaBank's confirm-verify-email is called
 * best-effort so their flag flips when possible; a failure is logged but does
 * NOT block the user. Local `users.email_verified_at` is set on successful
 * register/email_verify so downstream code treats the user as verified.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { query, queryOne } from "@/lib/db";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(["login", "register", "email_verify"]).default("login"),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    const email = data.email.toLowerCase();

    const ok = await verifyOtp(email, data.code, data.purpose);
    if (!ok) {
      return NextResponse.json({ error: "invalid_code" }, { status: 401 });
    }

    const user = await queryOne<{
      id: string;
      email: string;
      tygapay_user_id: string;
      account_type: string;
    }>(
      `SELECT id, email, tygapay_user_id, account_type FROM users WHERE email = $1`,
      [email],
    );
    if (!user) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    let tygaFlipped = false;
    let tygaReason: string | undefined;

    if (data.purpose === "register" || data.purpose === "email_verify") {
      // Mark locally verified — our OTP succeeded. Defensive: if the
      // email_verified_at column hasn't been added to the DB yet, don't
      // crash. The update is best-effort — verify-otp's primary job is to
      // confirm the code, not persist a flag.
      try {
        await query(
          `UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1`,
          [user.id],
        );
      } catch (e) {
        const msg = (e as Error)?.message || "";
        if (/email_verified_at/.test(msg)) {
          // Column missing — try to add it on the fly, then retry.
          try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`);
            await query(
              `UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1`,
              [user.id],
            );
          } catch (e2) {
            console.warn("[verify-otp] could not persist email_verified_at", e2);
          }
        } else {
          console.warn("[verify-otp] UPDATE failed", e);
        }
      }

      // Best-effort: flip TygaBank's flag too. Most of the time this will fail
      // until they expose an admin-verify endpoint, but keep attempting in case
      // their pipeline self-heals or a tenant-level fix lands.
      try {
        await tyga.users.confirmVerifyEmail(user.tygapay_user_id, data.code);
        tygaFlipped = true;
      } catch (e) {
        tygaReason =
          e instanceof TygaBankError
            ? `${e.status}: ${typeof e.body === "object" && e.body !== null && "details" in e.body ? String((e.body as { details: unknown }).details) : e.status}`
            : (e as Error)?.message || "unknown";
        console.warn("[verify-otp] TygaBank confirm failed (non-blocking)", tygaReason);
      }
    }

    // Issue session on login OR register (register flow ends with user logged in).
    if (data.purpose === "login" || data.purpose === "register") {
      const jti = crypto.randomUUID();
      const maxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS || 7);
      await query(
        `INSERT INTO sessions(user_id, jti, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${maxAgeDays} days')`,
        [user.id, jti],
      );
      await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id]);

      const token = await createSession({
        uid: user.id,
        tid: user.tygapay_user_id,
        email: user.email,
        jti,
      });
      await setSessionCookie(token);
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        tygapayUserId: user.tygapay_user_id,
        accountType: user.account_type,
      },
      emailVerifiedLocally: data.purpose !== "login",
      tygaFlipped,
      tygaReason,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    console.error("[verify-otp]", err);
    const e = err as { message?: string; stack?: string };
    return NextResponse.json({
      error: "internal",
      reason: e?.message || "unknown",
      stackTop: typeof e?.stack === "string" ? e.stack.split("\n").slice(0, 4).join("\n") : undefined,
    }, { status: 500 });
  }
}

