import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireSession();
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    await query(
      `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`,
      [id, s.uid],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[notifications/:id/read]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
