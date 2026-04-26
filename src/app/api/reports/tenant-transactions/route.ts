/**
 * GET /api/reports/tenant-transactions
 * Tenant-wide transaction reporting (admin/business surface). Proxies
 * TygaBank's GET /transactions/tenant. Same date constraints as the per-user
 * /api/transactions route (TygaBank caps ranges at 30 days).
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
      walletType: sp.get("walletType") || undefined,
      type: sp.get("type") || undefined,
      startDate: sp.get("startDate") || undefined,
      endDate: sp.get("endDate") || undefined,
      limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    };
    if (!query.startDate || !query.endDate) {
      const to = new Date();
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.startDate = from.toISOString().slice(0, 10);
      query.endDate = to.toISOString().slice(0, 10);
    }

    const cacheKey = `tyga:tenantTx:${s.tid}:${JSON.stringify(query)}`;
    const data = await cached(cacheKey, 30_000, () => tyga.reporting.tenantTransactions(query));
    return NextResponse.json({ transactions: Array.isArray(data) ? data : [] });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof TygaBankError) {
      const body = err.body as { message?: string; details?: string } | undefined;
      const message = body?.message || body?.details || "Couldn't fetch tenant transactions";
      console.error("[reports/tenant-transactions]", err.status, JSON.stringify(err.body));
      const status = err.status >= 400 && err.status < 500 ? 400 : 500;
      return NextResponse.json({ error: "tygabank_error", message, details: err.body }, { status });
    }
    console.error("[reports/tenant-transactions]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
