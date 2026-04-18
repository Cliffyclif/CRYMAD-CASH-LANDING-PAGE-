import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET() {
  try {
    const s = await requireSession();
    const data = await tyga.users.getCryptoDepositAddresses(s.tid);
    return NextResponse.json({ addresses: Array.isArray(data) ? data : [] });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    console.error("[crypto/deposit-addresses]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
