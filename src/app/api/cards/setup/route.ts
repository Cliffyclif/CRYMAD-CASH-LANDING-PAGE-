import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

const AddressSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  subdivision: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2),
});

const Schema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  cardHolderFirstName: z.string().min(1),
  cardHolderLastName: z.string().min(1),
  gender: z.number().int().min(0).max(2),
  dateOfBirth: z.string().min(1),
  placeOfBirth: z.string().min(2).max(3),
  occupation: z.number().int().nonnegative(),
  phoneNumber: z.string().min(1),
  phoneNumberCountryCode: z.string().length(2),
  address: AddressSchema,
});

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const body = Schema.parse(await req.json());
    const data = await tyga.cards.createAccount(s.tid, body as unknown as Record<string, unknown>);
    return NextResponse.json({ account: data });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input", details: err.issues }, { status: 400 });
    if (err instanceof TygaBankError) {
      console.error("[cards/setup][TygaBank]", err.status, JSON.stringify(err.body, null, 2));
      return NextResponse.json({ error: "tygabank_error", status: err.status, details: err.body }, { status: 500 });
    }
    console.error("[cards/setup]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
