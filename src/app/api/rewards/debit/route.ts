import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || !body.userId || !body.amount) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const result = await tyga.rewards.debit(body);
    return NextResponse.json({ result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    }
    console.error("[rewards/debit]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
