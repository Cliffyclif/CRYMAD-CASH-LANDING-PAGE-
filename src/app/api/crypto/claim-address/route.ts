import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({ network: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const { network } = Schema.parse(await req.json());
    const data = await tyga.users.claimCryptoDepositAddress(s.tid, network);
    return NextResponse.json({ address: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    console.error("[crypto/claim-address]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
