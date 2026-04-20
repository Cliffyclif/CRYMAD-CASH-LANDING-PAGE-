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
  password: z.string().min(8).max(128).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  accountType: z.enum(["individual", "business"]).default("individual"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = Schema.parse(json);

    const email = data.email.toLowerCase();
    const externalId = `crmdx_${email.replace(/[^a-z0-9]/g, "_")}`;

    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    let tygaUser;
    try {
      const exists = await tyga.users.exists({ email });
      if ((exists as { exists: boolean })?.exists) {
        const byEmail = await tyga.users.getByEmail(email);
        const u = Array.isArray((byEmail as { users?: unknown[] }).users)
          ? (byEmail as { users: Array<{ id: string }> }).users[0]
          : (byEmail as { id: string });
        tygaUser = u;
      }
    } catch {
      // fall through — create fresh
    }

    if (!tygaUser) {
      // TygaBank requires firstName/lastName on create. Our signup form only
      // collects email+password; real names are set later in complete-registration.
      // Derive sane placeholders from the email local-part so TygaBank accepts.
      const localPart = email.split("@")[0] || "user";
      const placeholderFirst = data.firstName || localPart.slice(0, 50) || "User";
      const placeholderLast = data.lastName || "Pending";
      try {
        tygaUser = await tyga.users.create({
          email,
          externalUserId: externalId,
          firstName: placeholderFirst,
          lastName: placeholderLast,
          createdBy: "crmdx-signup",
          type: data.accountType,
          sendWelcomeEmail: false,
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

    // TygaBank response field name varies: /user (create) returns `userId`,
    // /user?email=… (lookup) returns `id`. Normalize.
    const tygaId = String(
      (tygaUser as { id?: string; userId?: string }).id ??
        (tygaUser as { userId?: string }).userId ??
        "",
    );
    if (!tygaId) {
      return NextResponse.json({ error: "tygabank_error" }, { status: 500 });
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;
    await query(
      `INSERT INTO users (email, password_hash, tygapay_user_id, external_id, account_type)
         VALUES ($1, $2, $3, $4, $5)`,
      [email, passwordHash, tygaId, externalId, data.accountType],
    );

    // TygaBank's `autoVerifyEmail: true` on create is not honored by prod —
    // emailIsVerified stays false and blocks complete-registration. Use their
    // own verify round-trip instead: trigger sendVerifyEmail so TygaBank mails
    // a code, then verify-otp calls confirmVerifyEmail with that code.
    try {
      await tyga.users.sendVerifyEmail(tygaId);
    } catch (e) {
      console.warn("[register] tyga sendVerifyEmail failed", e);
    }
    // Also issue our own OTP as a fallback channel (dev logs, reset, etc).
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
      // Don't return HTTP 502 — Cloudflare replaces 502 responses from the
      // origin with its own plaintext error page, swallowing the JSON body.
      // Map TygaBank 4xx (client) to 400, 5xx to 500 so the client sees JSON.
      const status = err.status >= 400 && err.status < 500 ? 400 : 500;
      return NextResponse.json(
        { error: "tygabank_error", tygabankStatus: err.status, details: err.body },
        { status },
      );
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
