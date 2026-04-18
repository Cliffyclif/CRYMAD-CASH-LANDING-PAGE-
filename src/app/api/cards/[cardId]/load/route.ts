import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({
  amount: z.number().positive(),
  walletType: z.string().min(1),
  otp: z.string().min(4),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ cardId: string }> }) {
  try {
    const s = await requireSession();
    const { cardId } = await ctx.params;
    const body = Schema.parse(await req.json());
    const data = await tyga.cards.load(s.tid, cardId, body as unknown as Record<string, unknown>);
    return NextResponse.json({ result: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    console.error("[cards/load]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
