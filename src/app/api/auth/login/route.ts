/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 *   • Validates password against our DB
 *   • Issues session JWT in httpOnly cookie
 *   • Returns basic user info
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { query, queryOne } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    const email = data.email.toLowerCase();

    const user = await queryOne<{
      id: string;
      email: string;
      password_hash: string | null;
      tygapay_user_id: string;
      account_type: string;
    }>(
      `SELECT id, email, password_hash, tygapay_user_id, account_type FROM users WHERE email = $1`,
      [email],
    );

    // Generic error to avoid user enumeration
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(data.password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    // Create session
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
    console.error("[login]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
