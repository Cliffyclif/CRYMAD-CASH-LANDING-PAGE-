/**
 * POST /api/auth/reset-password
 * Body: { email, code, newPassword }
 *
 * Verifies the "reset" OTP sent via /api/auth/send-otp?purpose=reset,
 * then sets a new bcrypt password hash on the local user row.
 * Returns generic 400 on any failure so we don't leak whether the email exists.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query, queryOne } from "@/lib/db";
import { verifyOtp } from "@/lib/auth/otp";

const Schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    const email = data.email.toLowerCase();

    const user = await queryOne<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );
    if (!user) {
      return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }

    const ok = await verifyOtp(email, data.code, "reset");
    if (!ok) {
      return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }

    const hash = await bcrypt.hash(data.newPassword, 12);
    await query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, user.id],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
