import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { cached } from "@/lib/cache/memory";

export async function GET() {
  try {
    const s = await requireSession();
    const data = await cached(`tyga:deposits:${s.tid}`, 20_000, () => tyga.users.getCryptoDepositAddresses(s.tid));
    const d = data as { data?: unknown[]; addresses?: unknown[] } | unknown[];
    const arr = Array.isArray(d) ? d : (d?.data ?? d?.addresses ?? []);
    return NextResponse.json({ addresses: Array.isArray(arr) ? arr : [] });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    console.error("[crypto/deposit-addresses]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
