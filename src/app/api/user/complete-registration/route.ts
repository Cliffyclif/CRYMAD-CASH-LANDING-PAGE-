/**
 * POST /api/user/complete-registration
 * Calls TygaBank's complete-registration endpoint for the logged-in user,
 * then auto-provisions the native crypto wallet + default deposit addresses
 * + custodial wallets for common tokens so the user has a ready dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { query, queryOne } from "@/lib/db";

const Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1), // YYYY-MM-DD
  phoneNumber: z.string().min(4),
  languageCode: z.string().optional(),
  address: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    subdivision: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2).max(3),
  }),
});

// What to provision after complete-registration.
// Deposit networks give USDT/USDC receive addresses on each chain.
const AUTO_NETWORKS = ["ETH", "TRON", "BSC", "MATIC"] as const;
// Custodial native-token wallets (TygaBank /wallets/custodial/create).
const AUTO_CUSTODIAL_TOKENS = ["BTC", "ETH", "SOL", "XRP", "BNB", "LTT"] as const;

async function autoProvisionCrypto(tid: string): Promise<{
  cryptoWallet: "ok" | "skip" | "fail";
  networks: Array<{ network: string; ok: boolean }>;
  custodial: Array<{ token: string; ok: boolean }>;
}> {
  const result = {
    cryptoWallet: "ok" as "ok" | "skip" | "fail",
    networks: [] as Array<{ network: string; ok: boolean }>,
    custodial: [] as Array<{ token: string; ok: boolean }>,
  };

  // Step 1: native crypto wallet bucket. Safe to re-call; TygaBank is idempotent.
  try {
    await tyga.users.createCryptoWallet(tid);
  } catch (err) {
    // If TygaBank returns a "user_not_registered" -- KYC/registration not yet
    // flushed on their side -- skip; user can retry from the Crypto page.
    const e = err as { status?: number; body?: { code?: string } };
    if (e?.status === 400 && e?.body?.code === "user_not_registered") {
      result.cryptoWallet = "skip";
    } else {
      result.cryptoWallet = "fail";
    }
  }

  // Step 2: deposit addresses (USDT/USDC on 4 networks). Parallel, best-effort.
  const netCalls = AUTO_NETWORKS.map(async (network) => {
    try {
      await tyga.users.claimCryptoDepositAddress(tid, network);
      return { network, ok: true };
    } catch {
      return { network, ok: false };
    }
  });
  result.networks = await Promise.all(netCalls);

  // Step 3: custodial native wallets. Parallel, best-effort.
  const custCalls = AUTO_CUSTODIAL_TOKENS.map(async (token) => {
    try {
      await tyga.crypto.createCustodial({ userId: tid, token });
      return { token, ok: true };
    } catch {
      return { token, ok: false };
    }
  });
  result.custodial = await Promise.all(custCalls);

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const data = Schema.parse(await req.json());

    let tid = s.tid;
    let healed = false;

    try {
      await tyga.users.update(tid, data);
    } catch (err) {
      // Self-heal stale TygaBank IDs: if TygaBank doesn't know this user
      // (e.g. they were created on sandbox earlier), re-provision on the
      // current environment and retry the update.
      const is404 =
        err instanceof TygaBankError &&
        (err.status === 404 ||
          (typeof err.body === "object" && err.body !== null &&
            (err.body as { status?: string }).status === "user_not_found"));
      if (!is404) throw err;

      const localUser = await queryOne<{ id: string; email: string; external_id: string }>(
        `SELECT id, email, external_id FROM users WHERE id = $1`,
        [s.uid],
      );
      if (!localUser) throw err;

      let newTid: string | null = null;
      try {
        const byEmail = await tyga.users.getByEmail(localUser.email);
        const u = Array.isArray((byEmail as { users?: unknown[] }).users)
          ? (byEmail as { users: Array<{ id: string }> }).users[0]
          : (byEmail as { id: string });
        if (u?.id) newTid = u.id;
      } catch {
        /* fall through to create */
      }

      if (!newTid) {
        const created = await tyga.users.create({
          email: localUser.email,
          externalUserId: localUser.external_id,
          firstName: data.firstName,
          lastName: data.lastName,
          createdBy: "crmdx-heal",
          autoVerifyEmail: true,
          sendWelcomeEmail: false,
        });
        // Handle both { id } (lookup) and { userId } (create) response shapes.
        newTid = String(
          (created as { id?: string; userId?: string }).id ??
            (created as { userId?: string }).userId ??
            "",
        ) || null;
      }
      if (!newTid) throw new Error("TygaBank create returned no id");

      await query(
        `UPDATE users SET tygapay_user_id = $1, updated_at = NOW() WHERE id = $2`,
        [newTid, localUser.id],
      );
      tid = newTid;
      healed = true;

      // Retry the update with the fresh ID
      await tyga.users.update(tid, data);
    }

    // Fire-and-forget-ish auto-provisioning. We await it so the response
    // reflects what got created, but failures don't bubble — each wallet
    // attempt is wrapped in try/catch. Users can re-activate any missing
    // wallets from the Crypto page.
    const provisioned = await autoProvisionCrypto(tid);

    return NextResponse.json({ ok: true, healed, provisioned });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    }
    console.error("[complete-registration]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
