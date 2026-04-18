/**
 * GET  /api/beneficiaries           — list active beneficiaries
 * POST /api/beneficiaries           — add beneficiary
 * Data stored in our Postgres, not TygaBank.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { query } from "@/lib/db";

const CreateSchema = z.object({
  nickname: z.string().max(100).optional(),
  fullName: z.string().min(1).max(200),
  bankName: z.string().min(1).max(200),
  accountNumber: z.string().min(1).max(100),
  swiftBic: z.string().max(20).optional(),
  iban: z.string().max(50).optional(),
  currency: z.string().min(3).max(4),
  country: z.string().min(2).max(3),
});

export async function GET() {
  try {
    const s = await requireSession();
    const res = await query(
      `SELECT id, nickname, full_name, bank_name, account_number, swift_bic, iban, currency, country, created_at
         FROM beneficiaries
        WHERE user_id = $1 AND is_active = TRUE
        ORDER BY created_at DESC`,
      [s.uid],
    );
    const rows = res.rows.map((r) => ({
      id: r.id,
      nickname: r.nickname,
      fullName: r.full_name,
      bankName: r.bank_name,
      // Mask the account number — show only last 4
      accountNumberMasked: r.account_number ? `••••${String(r.account_number).slice(-4)}` : "",
      swiftBic: r.swift_bic,
      iban: r.iban,
      currency: r.currency,
      country: r.country,
      createdAt: r.created_at,
    }));
    return NextResponse.json({ beneficiaries: rows });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    console.error("[beneficiaries][GET]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const data = CreateSchema.parse(await req.json());
    const res = await query(
      `INSERT INTO beneficiaries(user_id, nickname, full_name, bank_name, account_number, swift_bic, iban, currency, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [s.uid, data.nickname ?? null, data.fullName, data.bankName, data.accountNumber, data.swiftBic ?? null, data.iban ?? null, data.currency, data.country],
    );
    return NextResponse.json({ ok: true, id: res.rows[0].id });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "invalid_input", details: err.flatten() }, { status: 400 });
    console.error("[beneficiaries][POST]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
