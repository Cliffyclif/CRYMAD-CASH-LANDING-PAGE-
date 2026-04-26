/**
 * POST /api/subscriptions — create a recurring billing subscription on TygaBank.
 * Returns approveUrl (hosted approval) + the subscription id.
 *
 * Body mirrors TygaBank's POST /subscriptions:
 *   { amount, currency, intervalUnit, intervalCount, externalSubscriptionId,
 *     description?, returnUrl?, webhookUrl?, ... }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import crypto from "node:crypto";

const Schema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(3).max(4).default("USD"),
  intervalUnit: z.enum(["day", "week", "month", "year"]).default("month"),
  intervalCount: z.number().int().positive().default(1),
  description: z.string().optional(),
  returnUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const data = Schema.parse(await req.json());
    const externalSubscriptionId = crypto.randomUUID();
    const result = await tyga.orders.subscriptions.create({
      userId: s.tid,
      externalSubscriptionId,
      ...data,
    });
    return NextResponse.json({ subscription: result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof TygaBankError) {
      const body = err.body as { message?: string; details?: string } | undefined;
      const message = body?.message || body?.details || "Couldn't create subscription";
      console.error("[subscriptions][POST]", err.status, JSON.stringify(err.body));
      const status = err.status >= 400 && err.status < 500 ? 400 : 500;
      return NextResponse.json({ error: "tygabank_error", message, details: err.body }, { status });
    }
    console.error("[subscriptions][POST]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
