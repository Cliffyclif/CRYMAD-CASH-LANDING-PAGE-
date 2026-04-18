import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET() {
  try {
    await requireSession();
    const data = await tyga.cards.getFees();
    return NextResponse.json({ fees: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) {
      const body = err.body as { status?: string; message?: string } | undefined;
      // Tenant fee config not yet provisioned — don't 502, return empty so the UI shows fallback.
      if (err.status === 404 || body?.status === "fee_config_not_found") {
        return NextResponse.json({ fees: [], unavailable: true });
      }
      console.error("[cards/fees][TygaBank]", err.status, JSON.stringify(err.body, null, 2));
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 502 });
    }
    console.error("[cards/fees]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
