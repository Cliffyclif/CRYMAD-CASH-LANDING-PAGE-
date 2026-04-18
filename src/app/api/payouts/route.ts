/**
 * Payouts — list via /api/transactions?type=payout on the client.
 * POST creates a new payout via TygaBank.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    // Delegate to /api/transactions?type=payout by re-using its implementation.
    const url = new URL(req.url);
    const forward = new URL("/api/transactions", url.origin);
    forward.searchParams.set("type", "payout");
    for (const [k, v] of url.searchParams.entries()) {
      if (k !== "type") forward.searchParams.set(k, v);
    }
    const res = await fetch(forward.toString(), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[payouts GET]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const { recipientUserId, amount, currency, externalTransactionId } = body as Record<string, unknown>;
    if (!recipientUserId || !amount || !currency || !externalTransactionId) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const payout = await tyga.transactions.createPayout(body as Record<string, unknown>);
    return NextResponse.json({ payout });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    }
    console.error("[payouts POST]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
