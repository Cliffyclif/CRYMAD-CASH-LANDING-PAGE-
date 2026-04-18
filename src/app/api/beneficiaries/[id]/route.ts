/**
 * DELETE /api/beneficiaries/:id  — soft-delete (set is_active = false)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireSession();
    const { id } = await ctx.params;
    await query(
      `UPDATE beneficiaries SET is_active = FALSE WHERE id = $1 AND user_id = $2`,
      [id, s.uid],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    console.error("[beneficiaries][DELETE]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
