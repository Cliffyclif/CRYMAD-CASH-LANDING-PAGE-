import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { db } from "./db.js";
import { sessions } from "./schema.js";
import { eq } from "drizzle-orm";
import { env } from "./env.js";

const COOKIE_NAME = "crymad_session";
const SESSION_DAYS = 7;

export interface SessionPayload {
  id: string;
  userId: string;
  email?: string;
  tygaClientToken?: string;
}

function signSessionId(id: string): string {
  return createHmac("sha256", env.BFF_SESSION_SECRET).update(id).digest("hex");
}

function packCookie(id: string): string {
  return `${id}.${signSessionId(id)}`;
}

function unpackCookie(raw: string): string | null {
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const expected = signSessionId(id);
  try {
    if (
      expected.length !== sig.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return id;
}

export async function createSession(
  c: Context,
  payload: { userId: string; email?: string; tygaClientToken?: string },
): Promise<SessionPayload> {
  const id = randomBytes(24).toString("hex");
  const now = Date.now();
  const expiresAt = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.insert(sessions)
    .values({
      id,
      userId: payload.userId,
      email: payload.email ?? null,
      tygaClientToken: payload.tygaClientToken ?? null,
      createdAt: now,
      expiresAt,
    })
    .run();
  setCookie(c, COOKIE_NAME, packCookie(id), {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // localhost
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return { id, userId: payload.userId, email: payload.email, tygaClientToken: payload.tygaClientToken };
}

export async function destroySession(c: Context): Promise<void> {
  const raw = getCookie(c, COOKIE_NAME);
  if (raw) {
    const id = unpackCookie(raw);
    if (id) {
      db.delete(sessions).where(eq(sessions.id, id)).run();
    }
  }
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}

export async function getSession(c: Context): Promise<SessionPayload | null> {
  const raw = getCookie(c, COOKIE_NAME);
  if (!raw) return null;
  const id = unpackCookie(raw);
  if (!id) return null;
  const rows = db.select().from(sessions).where(eq(sessions.id, id)).all();
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    db.delete(sessions).where(eq(sessions.id, id)).run();
    return null;
  }
  return {
    id: row.id,
    userId: row.userId,
    email: row.email ?? undefined,
    tygaClientToken: row.tygaClientToken ?? undefined,
  };
}

export const requireSession: MiddlewareHandler<{ Variables: { session: SessionPayload } }> =
  async (c, next) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "unauthenticated" }, 401);
    c.set("session", session);
    await next();
  };
