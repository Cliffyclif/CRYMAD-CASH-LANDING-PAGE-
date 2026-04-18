import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { query } from "@/lib/db";

export async function POST() {
  try {
    const s = await requireSession();
    await query(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
      [s.uid],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[notifications/mark-all-read]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
