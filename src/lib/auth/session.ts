/**
 * Session management via signed JWT in httpOnly cookie.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { queryOne } from "@/lib/db";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "crymad_session";
const MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS || 7);

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  uid: string;           // Crymad internal user id
  tid: string;           // TygaBank user id
  email: string;
  jti: string;           // session id (for revocation)
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_DAYS}d`)
    .setJti(payload.jti)
    .sign(secret());
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      uid: String(payload.uid),
      tid: String(payload.tid),
      email: String(payload.email),
      jti: String(payload.jti || ""),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** Read session from cookie — for use in API routes + server components.
 *  Side-effect: refreshes `tid` from Postgres so stale JWT IDs (e.g. from a
 *  sandbox→prod migration) don't poison downstream TygaBank calls. */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;
  // Optional: check if session is revoked in DB + resolve current TygaBank ID.
  try {
    const row = await queryOne<{ revoked_at: Date | null; tygapay_user_id: string | null }>(
      `SELECT s.revoked_at, u.tygapay_user_id
         FROM users u
         LEFT JOIN sessions s ON s.jti = $1
        WHERE u.id = $2`,
      [session.jti || "", session.uid],
    );
    if (row?.revoked_at) return null;
    if (row?.tygapay_user_id && row.tygapay_user_id !== session.tid) {
      session.tid = row.tygapay_user_id;
    }
  } catch {
    // If DB is unreachable, let the JWT alone gate access.
  }
  return session;
}

/** Throws 401 if not authenticated. */
export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return s;
}
