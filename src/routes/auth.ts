import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { tyga } from "../tyga.js";
import { authApi, usersApi } from "../tyga-client/index.js";
import { createSession, destroySession, getSession } from "../session.js";
import { db } from "../db.js";
import { userCache } from "../schema.js";

const loginSchema = z.object({
  email: z.string().email(),
});

const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  country: z.string().length(2).default("NG"),
  languageCode: z.string().default("en"),
  dateOfBirth: z.string().default("1990-01-01"),
  thirdPartyUserId: z.string().optional(),
});

export const authRoutes = new Hono();

// Demo login: look up user by email; if exists, mint session; otherwise fail.
// Real TygaPay SSO would be: redirect → callback → client-token → session.
authRoutes.post("/login", async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid body", details: parsed.error.flatten() }, 400);

  try {
    // Look up the user in our local cache (populated on register). This cluster doesn't
    // support email-based queries on TygaPay, so the cache keeps us reliable.
    const cached = db.select().from(userCache).where(eq(userCache.email, parsed.data.email)).all()[0];
    if (!cached?.userId) {
      return c.json({ error: "user not found", hint: "register first" }, 404);
    }
    // Cache has the userId — that's enough to mint a session. Optionally enrich from TygaPay.
    let user: Record<string, unknown> = {
      userId: cached.userId,
      email: cached.email,
      externalUserId: cached.externalUserId ?? undefined,
      firstName: cached.firstName ?? undefined,
      lastName: cached.lastName ?? undefined,
      tenantId: cached.tenantId ?? undefined,
    };
    try {
      const fresh = await usersApi.getUserBy(tyga, { userId: cached.userId });
      if (fresh && typeof fresh === "object") {
        user = { ...user, ...fresh, userId: cached.userId };
      }
    } catch {
      /* cached copy is enough */
    }
    // Mint TygaPay client-token for SSO session
    let tygaClientToken: string | undefined;
    try {
      const tokenResp = await authApi.clientToken(tyga, { userId: cached.userId });
      tygaClientToken = tokenResp.token;
    } catch {
      // Auth service may not be provisioned on sandbox — non-fatal for local dev
    }
    await createSession(c, {
      userId: cached.userId,
      email: (user.email as string | undefined) ?? parsed.data.email,
      tygaClientToken,
    });
    return c.json({ ok: true, user });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return c.json({ error: e.message ?? "login failed", status: e.status ?? 500 }, 500);
  }
});

authRoutes.post("/register", async (c) => {
  const parsed = registerSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid body", details: parsed.error.flatten() }, 400);
  try {
    // qqoeazmgga-uc cluster requires externalUserId + createdBy (not thirdPartyUserId).
    // We auto-generate both from the email if not provided.
    const slug = parsed.data.email.replace(/[^a-z0-9]/gi, "_");
    const body = {
      ...parsed.data,
      externalUserId: `crmdx_${slug}`,
      thirdPartyUserId: parsed.data.thirdPartyUserId ?? `crmdx_${slug}`,
      createdBy: "crmdx-signup",
    };
    const user = await usersApi.createUser(tyga, body);
    if (user.userId) {
      // Cache the email -> userId mapping so future logins can find this user.
      db.insert(userCache)
        .values({
          email: parsed.data.email,
          userId: user.userId,
          externalUserId: (user.externalUserId as string) ?? body.externalUserId,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          tenantId: (user.tenantId as string) ?? null,
          createdAt: Date.now(),
        })
        .onConflictDoUpdate({
          target: userCache.email,
          set: { userId: user.userId, firstName: parsed.data.firstName, lastName: parsed.data.lastName },
        })
        .run();
      await createSession(c, { userId: user.userId, email: user.email ?? parsed.data.email });
    }
    return c.json({ ok: true, user });
  } catch (err) {
    const e = err as { status?: number; message?: string; raw?: unknown };
    return c.json({ error: e.message ?? "register failed", status: e.status ?? 500, raw: e.raw }, 500);
  }
});

authRoutes.post("/logout", async (c) => {
  await destroySession(c);
  return c.json({ ok: true });
});

authRoutes.get("/me", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ authenticated: false });
  try {
    const user = await usersApi.getUserBy(tyga, { userId: session.userId });
    return c.json({ authenticated: true, session, user });
  } catch {
    return c.json({ authenticated: true, session });
  }
});
