/**
 * POST /api/auth/register
 *
 * Flow:
 *   1. Validate payload
 *   2. Check uniqueness in our DB + TygaBank
 *   3. Create TygaBank user (server-to-server)
 *   4. Insert local user row with bcrypt password hash
 *   5. Trigger email OTP for verification (register purpose)
 *   6. Return { userId } (no session yet — user must verify email first)
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query, queryOne } from "@/lib/db";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { createOtp } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/email/send";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128).optional(), // optional: OTP-only users
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  accountType: z.enum(["individual", "business"]).default("individual"),
});

// Health probe so we can verify which build is actually live.
export function GET() {
  return NextResponse.json({ route: "register", version: "v5-bisect-3-7" });
}

export async function POST(req: NextRequest) {
  // TEMP: bisect the crash — bypass handlePOST entirely for stage=0.
  const stage = req.nextUrl.searchParams.get("stage") || "full";
  try {
    if (stage === "0") {
      return NextResponse.json({ ok: true, stage: 0, note: "bare POST" });
    }
    if (stage === "1") {
      const body = await req.json().catch(() => ({}));
      return NextResponse.json({ ok: true, stage: 1, echoed: body });
    }
    if (stage === "2") {
      const body = await req.json().catch(() => ({}));
      const r = await tyga.users.exists({ email: String((body as { email?: string }).email || "probe@test.com") });
      return NextResponse.json({ ok: true, stage: 2, tygaExists: r });
    }
    if (stage === "3") {
      const body = await req.json().catch(() => ({})) as { email?: string };
      const email = String(body.email || "").toLowerCase();
      const row = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [email]);
      return NextResponse.json({ ok: true, stage: 3, dbRow: row });
    }
    if (stage === "4") {
      const body = await req.json().catch(() => ({})) as { email?: string };
      const email = String(body.email || "").toLowerCase();
      const externalId = `crmdx_${email.replace(/[^a-z0-9]/g, "_")}`;
      const created = await tyga.users.create({
        email, externalUserId: externalId, createdBy: "crmdx-bisect",
        sendWelcomeEmail: false, autoVerifyEmail: true,
      });
      return NextResponse.json({ ok: true, stage: 4, created });
    }
    if (stage === "5") {
      const hash = await bcrypt.hash("probepass", 12);
      return NextResponse.json({ ok: true, stage: 5, hashLen: hash.length });
    }
    if (stage === "6") {
      const body = await req.json().catch(() => ({})) as { email?: string };
      const email = String(body.email || "").toLowerCase();
      const code = await createOtp(email, "register");
      return NextResponse.json({ ok: true, stage: 6, code });
    }
    if (stage === "7") {
      const body = await req.json().catch(() => ({})) as { email?: string };
      const email = String(body.email || "").toLowerCase();
      const sent = await sendOtpEmail({ to: email, code: "000000", purpose: "register" });
      return NextResponse.json({ ok: true, stage: 7, sent });
    }
    return await handlePOST(req);
  } catch (err) {
    console.error("[register][top-catch]", err);
    const e = err as { message?: string; stack?: string };
    return NextResponse.json({
      error: "internal",
      reason: e?.message || "unknown",
      stackTop: typeof e?.stack === "string" ? e.stack.split("\n").slice(0, 4).join("\n") : undefined,
    }, { status: 500 });
  }
}

async function handlePOST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = Schema.parse(json);

    const email = data.email.toLowerCase();
    const externalId = `crmdx_${email.replace(/[^a-z0-9]/g, "_")}`;

    // 1. Uniqueness
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // 2. Check TygaBank
    let tygaUser;
    try {
      const exists = await tyga.users.exists({ email });
      if ((exists as { exists: boolean })?.exists) {
        // User exists in TygaBank but not in our DB — try to fetch & link
        const byEmail = await tyga.users.getByEmail(email);
        const u = Array.isArray((byEmail as { users?: unknown[] }).users)
          ? (byEmail as { users: Array<{ id: string }> }).users[0]
          : (byEmail as { id: string });
        tygaUser = u;
      }
    } catch {
      // fall through — create fresh
    }

    // 3. Create in TygaBank
    if (!tygaUser) {
      try {
        tygaUser = await tyga.users.create({
          email,
          externalUserId: externalId,
          firstName: data.firstName,
          lastName: data.lastName,
          createdBy: "crmdx-signup",
          type: data.accountType,
          sendWelcomeEmail: false,
          // Mark verified on TygaBank's side immediately — they won't email
          // the user. Our own OTP (sent via Resend) is the real proof-of-email
          // gate before we issue a session.
          autoVerifyEmail: true,
        });
      } catch (e) {
        const isAlready =
          e instanceof TygaBankError &&
          (e.status === 409 ||
            (typeof e.body === "object" && e.body !== null &&
              (e.body as { status?: string }).status === "user_already_exists"));
        if (!isAlready) throw e;
        const byEmail = await tyga.users.getByEmail(email);
        const u = Array.isArray((byEmail as { users?: unknown[] }).users)
          ? (byEmail as { users: Array<{ id: string }> }).users[0]
          : (byEmail as { id: string });
        if (!u?.id) throw e;
        tygaUser = u;
      }
    }

    // TygaBank's response field name varies: /user (create) returns `userId`,
    // /user?email=… (lookup) returns `id`. Normalize.
    const tygaId = String(
      (tygaUser as { id?: string; userId?: string }).id ??
        (tygaUser as { userId?: string }).userId ??
        "",
    );
    if (!tygaId) {
      console.error("[register] TygaBank returned user without id/userId:", tygaUser);
      return NextResponse.json({ error: "tygabank_error", status: 502 }, { status: 502 });
    }

    // 4. Insert local user
    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;
    await query(
      `INSERT INTO users (email, password_hash, tygapay_user_id, external_id, account_type)
         VALUES ($1, $2, $3, $4, $5)`,
      [email, passwordHash, tygaId, externalId, data.accountType],
    );

    // 5. Issue email OTP for verification
    const code = await createOtp(email, "register");
    if (process.env.NODE_ENV !== "production") {
      console.log(`[OTP][register] ${email} → ${code}`);
    }
    const sent = await sendOtpEmail({ to: email, code, purpose: "register", firstName: data.firstName });
    if (!sent.ok) console.warn("[register][email]", sent.error);
    return NextResponse.json({
      ok: true,
      userId: tygaId,
      email,
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof TygaBankError) {
      console.error("[register][TygaBank]", err.status, err.body);
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 502 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
