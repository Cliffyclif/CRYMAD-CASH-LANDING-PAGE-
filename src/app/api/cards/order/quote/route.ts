import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

export async function GET(req: NextRequest) {
  try {
    const s = await requireSession();
    const sp = req.nextUrl.searchParams;
    const walletType = sp.get("walletType") || undefined;
    const cardType = sp.get("cardType") || undefined;
    const query: Record<string, string | number | undefined> = { walletType, cardType };

    const data = cardType === "both"
      ? await tyga.cards.getOrderQuote(s.tid, query)
      : await tyga.cards.getSingleQuote(s.tid, query);
    return NextResponse.json({ quote: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof TygaBankError) {
      const body = err.body as { status?: string; message?: string } | undefined;
      // Tenant doesn't have card fee config set up yet (sandbox common case)
      if (err.status === 404 && body?.status === "fee_config_not_found") {
        return NextResponse.json({
          quote: null,
          unavailable: true,
          message: "Card pricing is not yet configured for this tenant. Contact support or try again later.",
        });
      }
      console.error("[cards/order/quote][TygaBank]", err.status, JSON.stringify(err.body, null, 2));
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 500 });
    }
    console.error("[cards/order/quote]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
