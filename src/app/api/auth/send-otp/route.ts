/**
 * POST /api/auth/send-otp
 * Body: { email, purpose?: "login" | "register" }
 *
 * Sends a 6-digit code to the user's email.
 * For "login", user must already exist in our DB.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryOne } from "@/lib/db";
import { createOtp } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/email/send";

const Schema = z.object({
  email: z.string().email(),
  purpose: z.enum(["login", "register", "email_verify", "reset"]).default("login"),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    const email = data.email.toLowerCase();

    if (data.purpose === "login" || data.purpose === "reset") {
      const user = await queryOne<{ id: string; tygapay_user_id: string }>(
        `SELECT id, tygapay_user_id FROM users WHERE email = $1`,
        [email],
      );
      if (!user) {
        // Do not reveal that the user doesn't exist
        return NextResponse.json({ ok: true });
      }
      const code = await createOtp(email, data.purpose);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[OTP][${data.purpose}] ${email} → ${code}`);
      }
      const sent = await sendOtpEmail({ to: email, code, purpose: data.purpose });
      if (!sent.ok) console.warn("[send-otp][email]", sent.error);
      return NextResponse.json({
        ok: true,
        devCode: process.env.NODE_ENV !== "production" ? code : undefined,
      });
    }

    // register / email_verify: TygaBank flow is driven by register endpoint
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
