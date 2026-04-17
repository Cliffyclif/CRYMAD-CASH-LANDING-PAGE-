import { Hono } from "hono";
import { z } from "zod";
import { requireSession, type SessionPayload } from "../session.js";
import { tyga } from "../tyga.js";
import { transactionsApi, usersApi, cryptoApi, ordersApi } from "@crymad/api-client";

export const walletRoutes = new Hono<{ Variables: { session: SessionPayload } }>();
walletRoutes.use("*", requireSession);

walletRoutes.get("/balances", async (c) => {
  const { userId } = c.get("session");
  try {
    const wallets = await usersApi.getUserWallets(tyga, userId);
    return c.json({ wallets });
  } catch (err) {
    return c.json({ error: String((err as Error).message ?? err) }, 500);
  }
});

walletRoutes.get("/deposit-addresses", async (c) => {
  const { userId } = c.get("session");
  try {
    const addresses = await usersApi.getCryptoDepositAddresses(tyga, userId);
    return c.json({ addresses });
  } catch (err) {
    return c.json({ error: String((err as Error).message ?? err) }, 500);
  }
});

const sendSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  externalTransactionId: z.string().min(1).optional(),
});

walletRoutes.post("/send", async (c) => {
  const { userId } = c.get("session");
  const parsed = sendSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid body" }, 400);
  try {
    const tx = await transactionsApi.ewalletDebit(tyga, {
      userId,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      externalTransactionId: parsed.data.externalTransactionId ?? `tx_${Date.now()}`,
      createdBy: userId,
    });
    return c.json(tx);
  } catch (err) {
    const e = err as { status?: number; message?: string; raw?: unknown };
    return c.json({ error: e.message, raw: e.raw }, (e.status as 400) ?? 500);
  }
});

const topupSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USDT"),
});

walletRoutes.post("/topup", async (c) => {
  const parsed = topupSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid body" }, 400);
  try {
    const order = await ordersApi.createOrder(tyga, {
      orderType: "deposit",
      amount: parsed.data.amount,
      currency: parsed.data.currency,
    });
    return c.json(order);
  } catch (err) {
    const e = err as { status?: number; message?: string; raw?: unknown };
    return c.json({ error: e.message, raw: e.raw }, (e.status as 400) ?? 500);
  }
});

const convertSchema = z.object({
  from: z.string(),
  to: z.string(),
  fromAmount: z.number().positive(),
});

walletRoutes.post("/convert/estimate", async (c) => {
  const { userId } = c.get("session");
  const parsed = convertSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid body" }, 400);
  try {
    const estimate = await cryptoApi.estimateSwap(tyga, { ...parsed.data, userId });
    return c.json(estimate);
  } catch (err) {
    const e = err as { status?: number; message?: string; raw?: unknown };
    return c.json({ error: e.message, raw: e.raw }, (e.status as 400) ?? 500);
  }
});
