/**
 * POST /api/auth/resend-verify
 * Body: { email }
 * Triggers TygaBank's sendVerifyEmail for the given email so the user
 * receives a TygaBank-issued code that, when confirmed, flips their
 * emailIsVerified flag. Also re-issues our fallback OTP.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryOne } from "@/lib/db";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { createOtp } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/email/send";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email: raw } = Schema.parse(await req.json());
    const email = raw.toLowerCase();

    const user = await queryOne<{ id: string; tygapay_user_id: string }>(
      `SELECT id, tygapay_user_id FROM users WHERE email = $1`,
      [email],
    );
    if (!user) {
      // Don't leak existence — return ok anyway.
      return NextResponse.json({ ok: true });
    }

    let tygaSent = false;
    try {
      await tyga.users.sendVerifyEmail(user.tygapay_user_id);
      tygaSent = true;
    } catch (e) {
      console.warn("[resend-verify] tyga sendVerifyEmail failed", e);
    }

    // Also re-issue our own OTP so the user always has a usable code path.
    const code = await createOtp(email, "register");
    const sent = await sendOtpEmail({ to: email, code, purpose: "register" });
    if (!sent.ok) console.warn("[resend-verify][email]", sent.error);

    return NextResponse.json({
      ok: true,
      tygaSent,
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 400 });
    }
    console.error("[resend-verify]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
