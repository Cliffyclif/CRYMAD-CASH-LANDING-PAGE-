import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function POST() {
  try {
    const s = await requireSession();
    const result = await tyga.users.startKycSession(s.tid);
    return NextResponse.json({ ok: true, session: result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    }
    console.error("[kyc-session]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
