/**
 * PUT /api/subscriptions/:id/cancel — cancel subscription.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function PUT(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
    const result = await tyga.orders.subscriptions.cancel(id, { cancelledBy: "user" });
    return NextResponse.json({ result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    }
    console.error("[subscriptions/:id/cancel]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
