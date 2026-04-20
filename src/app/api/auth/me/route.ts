/**
 * GET /api/auth/me
 * Returns the current user bundle: our DB user + TygaBank user + wallets.
 * 401 if not logged in.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { queryOne } from "@/lib/db";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  try {
    const local = await queryOne<{
      id: string;
      email: string;
      account_type: string;
      tygapay_user_id: string;
      email_verified_at: Date | null;
      created_at: Date;
      last_login_at: Date | null;
    }>(
      `SELECT id, email, account_type, tygapay_user_id, email_verified_at, created_at, last_login_at
         FROM users WHERE id = $1`,
      [s.uid],
    );
    if (!local) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    // Prefer the Postgres-stored TygaBank ID over the session JWT one. The JWT
    // is issued at login and won't reflect any in-flight healing (e.g. when a
    // sandbox-era TID gets migrated to prod on complete-registration).
    const tid = local.tygapay_user_id || s.tid;

    // Parallel fetch of TygaBank user + wallets
    const [tygaUser, wallets] = await Promise.all([
      tyga.users.getById(tid).catch(() => null),
      tyga.users.getWallets(tid).catch(() => []),
    ]);

    return NextResponse.json({
      user: {
        id: local.id,
        email: local.email,
        accountType: local.account_type,
        tygapayUserId: local.tygapay_user_id,
        firstName: tygaUser?.firstName,
        lastName: tygaUser?.lastName,
        kycStatus: tygaUser?.kycStatus ?? "not_started",
        // Local verification wins — we own the OTP lifecycle. TygaBank's flag is
        // secondary and often lags due to their email-delivery issues.
        emailVerified: !!local.email_verified_at || (tygaUser?.emailIsVerified ?? false),
        emailVerifiedLocally: !!local.email_verified_at,
        emailVerifiedOnTygabank: tygaUser?.emailIsVerified ?? false,
        completedRegistration: tygaUser?.completedRegistration ?? false,
        phoneNumber: tygaUser?.phoneNumber,
        dateOfBirth: tygaUser?.dateOfBirth,
        createdAt: local.created_at,
        lastLoginAt: local.last_login_at,
      },
      wallets: Array.isArray(wallets) ? wallets : [],
    });
  } catch (err) {
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error" }, { status: 500 });
    }
    console.error("[me]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
