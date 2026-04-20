import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({
  token: z.string().min(1),
  amount: z.number().positive(),
  toAddress: z.string().min(1),
  otp: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const body = Schema.parse(await req.json());
    const data = await tyga.crypto.sendCustodial({
      userId: s.tid,
      token: body.token,
      amount: body.amount,
      toAddress: body.toAddress,
      otp: body.otp,
    });
    return NextResponse.json({ result: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 500 });
    console.error("[crypto/send]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
