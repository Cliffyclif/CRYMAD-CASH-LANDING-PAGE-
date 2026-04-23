import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { cached } from "@/lib/cache/memory";

export async function GET() {
  try {
    const s = await requireSession();
    const data = await cached(`tyga:custodial:${s.tid}`, 20_000, () => tyga.crypto.listCustodial(s.tid));
    // TygaBank returns { status: "success", data: [...] }. Older shape: { wallets: [...] }.
    const d = data as { data?: unknown[]; wallets?: unknown[] } | unknown[];
    const arr = Array.isArray(d) ? d : (d?.data ?? d?.wallets ?? []);
    const out = Array.isArray(arr) ? arr : [];
    return NextResponse.json({ wallets: out });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) {
      // Sandbox: listCustodial is not available. Degrade gracefully.
      const body = err.body as { details?: string } | undefined;
      if (err.status === 500 && body?.details?.includes("non-production")) {
        return NextResponse.json({ wallets: [], sandbox: true });
      }
      console.error("[crypto/wallets][TygaBank]", err.status, err.body);
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 500 });
    }
    console.error("[crypto/wallets]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
