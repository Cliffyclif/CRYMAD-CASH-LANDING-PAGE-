import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { invalidate } from "@/lib/cache/memory";

const Schema = z.object({ network: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const { network } = Schema.parse(await req.json());
    let data;
    try {
      data = await tyga.users.claimCryptoDepositAddress(s.tid, network);
    } catch (e) {
      // If the user has no crypto wallet yet, TygaBank rejects the claim.
      // Auto-provision then retry once.
      const msg = JSON.stringify((e as TygaBankError)?.body || "").toLowerCase();
      const isMissing =
        e instanceof TygaBankError &&
        (msg.includes("wallet") || msg.includes("not_found") || msg.includes("no crypto"));
      if (!isMissing) throw e;
      try {
        await tyga.users.createCryptoWallet(s.tid);
      } catch (ce) {
        console.warn("[crypto/claim-address] createCryptoWallet failed", ce);
      }
      data = await tyga.users.claimCryptoDepositAddress(s.tid, network);
    }
    invalidate(`tyga:deposits:${s.tid}`);
    return NextResponse.json({ address: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) {
      const body = err.body as { message?: string; details?: string } | undefined;
      const message = body?.message || body?.details || "Couldn't activate network";
      console.error("[crypto/claim-address][TygaBank]", err.status, JSON.stringify(err.body));
      return NextResponse.json({ error: "tygabank_error", message, details: err.body }, { status: 400 });
    }
    console.error("[crypto/claim-address]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
