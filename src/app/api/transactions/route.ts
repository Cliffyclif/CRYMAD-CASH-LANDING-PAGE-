/**
 * GET /api/transactions?walletType=&type=&startDate=&endDate=&limit=
 * Proxies to TygaBank reporting endpoint filtered by current user.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { cached } from "@/lib/cache/memory";

export async function GET(req: NextRequest) {
  try {
    const s = await requireSession();
    const sp = req.nextUrl.searchParams;
    const query: Record<string, string | number | undefined> = {
      userIds: s.tid,
      walletType: sp.get("walletType") || undefined,
      type: sp.get("type") || undefined,
      startDate: sp.get("startDate") || undefined,
      endDate: sp.get("endDate") || undefined,
      limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    };

    // TygaBank caps date ranges at 30 days.
    if (!query.startDate || !query.endDate) {
      const to = new Date();
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.startDate = from.toISOString().slice(0, 10);
      query.endDate = to.toISOString().slice(0, 10);
    }

    // TygaBank reporting is slow (~15s). Cache 30s per unique query.
    const cacheKey = `tyga:tx:${s.tid}:${JSON.stringify(query)}`;
    const data = await cached(cacheKey, 30_000, () => tyga.reporting.userTransactions(query));
    return NextResponse.json({ transactions: Array.isArray(data) ? data : [] });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      console.error("[transactions][TygaBank]", err.status, err.body);
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 500 });
    }
    console.error("[transactions]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
