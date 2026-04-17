import { Hono } from "hono";
import { z } from "zod";
import { tyga } from "../tyga.js";
import { authApi, usersApi } from "@crymad/api-client";
import { createSession, destroySession, getSession } from "../session.js";

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
    const user = await usersApi.getUserBy(tyga, { email: parsed.data.email });
    if (!user || !user.userId) {
      return c.json({ error: "user not found", hint: "register first" }, 404);
    }
    // Mint TygaPay client-token for SSO session
    let tygaClientToken: string | undefined;
    try {
      const tokenResp = await authApi.clientToken(tyga, { userId: user.userId });
      tygaClientToken = tokenResp.token;
    } catch {
      // Auth service may not be provisioned on sandbox — non-fatal for local dev
    }
    await createSession(c, {
      userId: user.userId,
      email: user.email ?? parsed.data.email,
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
    // Auto-generate thirdPartyUserId from email if missing (TygaPay requires it)
    const body = {
      ...parsed.data,
      thirdPartyUserId: parsed.data.thirdPartyUserId ?? `crmdx_${parsed.data.email.replace(/[^a-z0-9]/gi, "_")}`,
    };
    const user = await usersApi.createUser(tyga, body);
    if (user.userId) {
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
