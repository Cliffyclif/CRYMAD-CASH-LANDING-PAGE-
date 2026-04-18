import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { clearSessionCookie, getSession } from "@/lib/auth/session";

export async function POST() {
  const s = await getSession();
  if (s?.jti) {
    try {
      await query(`UPDATE sessions SET revoked_at = NOW() WHERE jti = $1`, [s.jti]);
    } catch { /* ignore */ }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
