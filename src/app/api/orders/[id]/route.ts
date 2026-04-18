/**
 * GET /api/orders/:id — fetch order by id from TygaBank.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
    const order = await tyga.orders.getById(id);
    return NextResponse.json({ order });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: err.status === 404 ? 404 : 502 });
    }
    console.error("[orders/:id]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
