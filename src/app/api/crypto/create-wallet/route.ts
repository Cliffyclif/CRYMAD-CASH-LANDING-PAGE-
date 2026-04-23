import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { invalidate } from "@/lib/cache/memory";

const Schema = z.object({ token: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const { token } = Schema.parse(await req.json());
    const data = await tyga.crypto.createCustodial({ userId: s.tid, token });
    invalidate(`tyga:custodial:${s.tid}`);
    return NextResponse.json({ wallet: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    if (err instanceof TygaBankError) {
      const body = err.body as { message?: string; details?: string } | undefined;
      if (err.status === 500 && body?.details?.includes("non-production")) {
        return NextResponse.json(
          { error: "sandbox_unsupported", message: "Creating custom crypto wallets is only available in production. The sandbox auto-provisions your default wallet." },
          { status: 409 },
        );
      }
      console.error("[crypto/create-wallet][TygaBank]", err.status, JSON.stringify(err.body, null, 2));
      const message = body?.message || body?.details || "Couldn't activate this token";
      return NextResponse.json({ error: "tygabank_error", message, status: err.status, details: err.body }, { status: 400 });
    }
    console.error("[crypto/create-wallet]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
