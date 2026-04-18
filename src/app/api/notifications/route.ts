import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { query } from "@/lib/db";

interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  read_at: Date | null;
  created_at: Date;
}

export async function GET(req: NextRequest) {
  try {
    const s = await requireSession();
    const sp = req.nextUrl.searchParams;
    const unreadOnly = sp.get("unread") === "1";
    const limit = Math.min(Number(sp.get("limit") || 20), 100);

    const where = unreadOnly
      ? "WHERE user_id = $1 AND read_at IS NULL"
      : "WHERE user_id = $1";

    const rowsRes = await query<NotificationRow>(
      `SELECT id, kind, title, body, link, read_at, created_at
       FROM notifications ${where}
       ORDER BY created_at DESC
       LIMIT $2`,
      [s.uid, limit],
    );

    const unreadRes = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [s.uid],
    );
    const unreadCount = Number(unreadRes.rows[0]?.c ?? 0);

    return NextResponse.json({
      notifications: rowsRes.rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        body: r.body,
        link: r.link,
        readAt: r.read_at ? r.read_at.toISOString() : null,
        createdAt: r.created_at.toISOString(),
      })),
      unreadCount,
    });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[notifications GET]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || !body.kind || !body.title || !body.body) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const res = await query<{ id: string }>(
      `INSERT INTO notifications (user_id, kind, title, body, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [s.uid, body.kind, body.title, body.body, body.link ?? null],
    );
    return NextResponse.json({ id: res.rows[0]?.id });
  } catch (err) {
    if ((err as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[notifications POST]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
