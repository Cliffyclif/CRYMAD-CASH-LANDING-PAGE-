/**
 * POST /api/auth/verify-otp
 * Body: { email, code, purpose: "login" | "register" }
 *
 * On success:
 *   • "login": issues session cookie and returns user
 *   • "register": marks email verified in our DB + calls TygaBank confirm-verify-email
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

    // For register/email_verify: TygaBank's code is the ONLY acceptable
    // credential — it's what flips their emailIsVerified flag. Local OTP
    // fallback would succeed without flipping the flag, making
    // complete-registration fail later with a confusing error.
    if (data.purpose === "register" || data.purpose === "email_verify") {
      try {
        await tyga.users.confirmVerifyEmail(user.tygapay_user_id, data.code);
      } catch (e) {
        const tb =
          e instanceof TygaBankError && typeof e.body === "object" && e.body !== null
            ? (e.body as { details?: string; status?: string; message?: string })
            : null;
        console.error("[verify-otp] TygaBank confirm failed", {
          tid: user.tygapay_user_id,
          status: e instanceof TygaBankError ? e.status : undefined,
          body: tb,
        });
        const details = tb?.details || "";
        if (/timeout|expired/i.test(details)) {
          return NextResponse.json({ error: "code_expired", tygabank: tb }, { status: 401 });
        }
        return NextResponse.json({ error: "invalid_code", tygabank: tb }, { status: 401 });
      }
      // Also consume any matching local OTP so it can't be replayed, but don't
      // require it to match.
      await verifyOtp(email, data.code, data.purpose).catch(() => false);
    } else {
      const ok = await verifyOtp(email, data.code, data.purpose);
      if (!ok) {
        return NextResponse.json({ error: "invalid_code" }, { status: 401 });
      }
    }

    // If logging in, issue session
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
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
