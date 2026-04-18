/**
 * POST /api/user/complete-registration
 * Calls TygaBank's complete-registration endpoint for the logged-in user.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1), // YYYY-MM-DD
  phoneNumber: z.string().min(4),
  languageCode: z.string().optional(),
  address: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    subdivision: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2).max(3),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const data = Schema.parse(await req.json());
    const result = await tyga.users.update(s.tid, data);
    return NextResponse.json({ ok: true, user: result });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof TygaBankError) {
      return NextResponse.json({ error: "tygabank_error", details: err.body }, { status: 502 });
    }
    console.error("[complete-registration]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
