import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({
  cardType: z.string().min(1),
  walletType: z.string().min(1),
  otp: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const body = Schema.parse(await req.json());
    const data = body.cardType === "both"
      ? await tyga.cards.orderCards(s.tid, body as unknown as Record<string, unknown>)
      : await tyga.cards.orderSingle(s.tid, body as unknown as Record<string, unknown>);
    return NextResponse.json({ order: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    console.error("[cards/order]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
