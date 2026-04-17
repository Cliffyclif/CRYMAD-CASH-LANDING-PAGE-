import { Hono } from "hono";
import { requireSession, type SessionPayload } from "../session.js";
import { tyga } from "../tyga.js";
import { usersApi, transactionsApi } from "@crymad/api-client";

export const dashboardRoutes = new Hono<{ Variables: { session: SessionPayload } }>();

dashboardRoutes.use("*", requireSession);

function fmtCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function fmtMonthYear(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function errInfo(reason: unknown) {
  if (!reason || typeof reason !== "object") return { message: String(reason) };
  const e = reason as { status?: number; message?: string; raw?: unknown };
  return { status: e.status, message: e.message ?? String(reason) };
}

dashboardRoutes.get("/summary", async (c) => {
  const session = c.get("session");

  const [userResult, txResult] = await Promise.allSettled([
    usersApi.getUserBy(tyga, { userId: session.userId }),
    transactionsApi.listUserTransactions(tyga, session.userId),
  ]);

  const user = userResult.status === "fulfilled" ? userResult.value : null;
  const transactions =
    txResult.status === "fulfilled" && Array.isArray(txResult.value) ? txResult.value : [];

  const firstName = (user?.firstName as string | undefined) ?? "";
  const lastName = (user?.lastName as string | undefined) ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const email = (user?.email as string | undefined) ?? session.email ?? "";
  const createdDate = (user?.createdDate as string | undefined) ?? (user?.createdAt as string | undefined);

  // Slot payload — ready-to-render strings for stitch HTML data-slot bridges.
  const slots: Record<string, string> = {
    fullName,
    firstName: firstName || "User",
    lastName,
    email,
    userId: session.userId,
    memberSince: fmtMonthYear(createdDate),
    accountType: "PERSONAL ACCOUNT",
    kycStatus: user?.isActive ? "ACTIVE · SANDBOX" : "PENDING",
    accountTier: "Sandbox",
    balanceTotal: fmtCurrency(0),
    balanceEWallet: fmtCurrency(0),
    balanceCrypto: fmtCurrency(0),
    balanceCards: fmtCurrency(0),
    currencyCode: "USD",
    transactionCount: String(transactions.length),
  };

  return c.json({
    slots,
    user,
    transactions,
    errors: {
      user: userResult.status === "rejected" ? errInfo(userResult.reason) : undefined,
      transactions: txResult.status === "rejected" ? errInfo(txResult.reason) : undefined,
    },
  });
});
