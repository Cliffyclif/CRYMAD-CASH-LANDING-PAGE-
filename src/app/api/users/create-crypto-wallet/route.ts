import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function POST() {
  try {
    const s = await requireSession();
    const data = await tyga.users.createCryptoWallet(s.tid);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) {
      console.error("[create-crypto-wallet][TygaBank]", err.status, err.body);
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 502 });
    }
    console.error("[users/create-crypto-wallet]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
