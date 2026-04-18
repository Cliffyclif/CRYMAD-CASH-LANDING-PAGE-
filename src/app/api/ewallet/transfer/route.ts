/**
 * POST /api/ewallet/transfer
 * Internal transfer from current user to another (by email or userId).
 * Implements as a payout from tenant -> recipient (TygaBank pattern).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import crypto from "node:crypto";

const Schema = z.object({
  recipientEmail: z.string().email().optional(),
  recipientUserId: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().max(200).optional(),
  currency: z.string().default("USD"),
});

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const data = Schema.parse(await req.json());

    // Resolve recipient user id
    let userId = data.recipientUserId;
    if (!userId && data.recipientEmail) {
      const match = await tyga.users.getByEmail(data.recipientEmail);
      const arr = (match as { users?: Array<{ id: string }> }).users;
      userId = arr?.[0]?.id || (match as { id?: string }).id;
    }
    if (!userId) {
      return NextResponse.json({ error: "recipient_not_found" }, { status: 404 });
    }

    const ext = crypto.randomUUID();
    const result = await tyga.transactions.createPayout({
      userId,
      amount: data.amount,
      currency: data.currency,
      externalTransactionId: ext,
      createdBy: "crmdx-transfer",
      email: data.recipientEmail,
      description: data.description,
      processImmediately: false,
    });
    return NextResponse.json({ ok: true, txn: result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    console.error("[ewallet/transfer]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
