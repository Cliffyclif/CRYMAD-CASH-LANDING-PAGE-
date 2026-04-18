import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import crypto from "node:crypto";

const Schema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const data = Schema.parse(await req.json());
    const ext = crypto.randomUUID();
    const result = await tyga.transactions.ewalletDebit({
      userId: s.tid,
      amount: data.amount,
      currency: data.currency,
      externalTransactionId: ext,
      description: data.description,
      createdBy: "crmdx-ewallet-debit",
    });
    return NextResponse.json({ ok: true, txn: result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    console.error("[ewallet/debit]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
