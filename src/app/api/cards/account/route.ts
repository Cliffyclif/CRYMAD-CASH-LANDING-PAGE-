import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET() {
  try {
    const s = await requireSession();
    const data = await tyga.cards.getAccount(s.tid);
    return NextResponse.json({ account: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) {
      if (err.status === 404) return NextResponse.json({ account: null }, { status: 200 });
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    }
    console.error("[cards/account]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
