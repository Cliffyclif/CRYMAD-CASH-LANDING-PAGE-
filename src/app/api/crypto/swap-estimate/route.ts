import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({
  amount: z.number().positive(),
  toCurrency: z.string().min(1),
  fromCurrency: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const body = Schema.parse(await req.json());
    const data = await tyga.crypto.estimateSwap({
      userId: s.tid,
      amount: body.amount,
      toCurrency: body.toCurrency,
      ...(body.fromCurrency ? { fromCurrency: body.fromCurrency } : {}),
    });
    return NextResponse.json({ estimate: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    console.error("[crypto/swap-estimate]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
