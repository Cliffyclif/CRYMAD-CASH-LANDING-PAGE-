/**
 * POST /api/user/complete-registration
 * Calls TygaBank's complete-registration endpoint for the logged-in user.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { tyga, TygaBankError } from "@/lib/tygabank/client";
import { query, queryOne } from "@/lib/db";

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

    let tid = s.tid;
    try {
      const result = await tyga.users.update(tid, data);
      return NextResponse.json({ ok: true, user: result });
    } catch (err) {
      // Self-heal stale TygaBank IDs: if prod TygaBank doesn't know this user
      // (e.g. they were created on sandbox earlier), re-provision on the
      // current environment and retry the update.
      const is404 =
        err instanceof TygaBankError &&
        (err.status === 404 ||
          (typeof err.body === "object" && err.body !== null &&
            (err.body as { status?: string }).status === "user_not_found"));
      if (!is404) throw err;

      const localUser = await queryOne<{ id: string; email: string; external_id: string }>(
        `SELECT id, email, external_id FROM users WHERE id = $1`,
        [s.uid],
      );
      if (!localUser) throw err;

      // Try link-by-email first (user may already exist on current env)
      let newTid: string | null = null;
      try {
        const byEmail = await tyga.users.getByEmail(localUser.email);
        const u = Array.isArray((byEmail as { users?: unknown[] }).users)
          ? (byEmail as { users: Array<{ id: string }> }).users[0]
          : (byEmail as { id: string });
        if (u?.id) newTid = u.id;
      } catch {
        /* fall through to create */
      }

      if (!newTid) {
        const created = await tyga.users.create({
          email: localUser.email,
          externalUserId: localUser.external_id,
          firstName: data.firstName,
          lastName: data.lastName,
          createdBy: "crmdx-heal",
          autoVerifyEmail: true,
          sendWelcomeEmail: false,
        });
        newTid = created.id;
      }

      // Persist the corrected TygaBank ID
      await query(
        `UPDATE users SET tygapay_user_id = $1, updated_at = NOW() WHERE id = $2`,
        [newTid, localUser.id],
      );
      tid = newTid;

      // Retry the update with the fresh ID
      const result = await tyga.users.update(tid, data);
      return NextResponse.json({ ok: true, user: result, healed: true });
    }
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
    const e = err as { message?: string; code?: string; stack?: string };
    return NextResponse.json({
      error: "internal",
      debug: { message: e?.message, code: e?.code, stackTop: typeof e?.stack === "string" ? e.stack.split("\n").slice(0, 4).join("\n") : undefined },
    }, { status: 500 });
  }
}
