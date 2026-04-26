/**
 * POST /api/orders — create a hosted-checkout order on TygaBank.
 * Used as a fiat on-ramp: user pays with debit/credit card on the returned
 * paymentUrl, funds settle into their wallet via webhook.
 *
 * Body shape mirrors TygaBank's POST /:
 *   { amount, currency, externalTransactionId, description?, type?,
 *     fixedAmount?, walletType?, returnUrl?, webhookUrl?, ... }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import crypto from "node:crypto";

const Schema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(3).max(4).default("USD"),
  description: z.string().optional(),
  type: z.enum(["payment", "deposit"]).default("deposit"),
  walletType: z.enum(["ewallet", "crypto", "card", "rewards"]).optional(),
  fixedAmount: z.boolean().optional(),
  returnUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const data = Schema.parse(await req.json());
    const externalTransactionId = crypto.randomUUID();
    const result = await tyga.orders.create({
      userId: s.tid,
      externalTransactionId,
      ...data,
    });
    return NextResponse.json({ order: result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof TygaBankError) {
      const body = err.body as { message?: string; details?: string } | undefined;
      const message = body?.message || body?.details || "Couldn't create order";
      console.error("[orders][POST]", err.status, JSON.stringify(err.body));
      const status = err.status >= 400 && err.status < 500 ? 400 : 500;
      return NextResponse.json({ error: "tygabank_error", message, details: err.body }, { status });
    }
    console.error("[orders][POST]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
