import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET() {
  try {
    const s = await requireSession();
    const data = await tyga.crypto.listCustodial(s.tid);
    const arr = Array.isArray(data) ? data : (data as { wallets?: unknown[] })?.wallets ?? [];
    return NextResponse.json({ wallets: Array.isArray(arr) ? arr : [] });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) {
      // Sandbox: listCustodial is not available. Degrade gracefully.
      const body = err.body as { details?: string } | undefined;
      if (err.status === 500 && body?.details?.includes("non-production")) {
        return NextResponse.json({ wallets: [], sandbox: true });
      }
      console.error("[crypto/wallets][TygaBank]", err.status, err.body);
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 502 });
    }
    console.error("[crypto/wallets]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
