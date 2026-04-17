import { Hono } from "hono";
import { requireSession, type SessionPayload } from "../session.js";
import { tyga } from "../tyga.js";
import { usersApi } from "@crymad/api-client";

export const meRoutes = new Hono<{ Variables: { session: SessionPayload } }>();
meRoutes.use("*", requireSession);

function fmtMonthYear(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Universal personalization payload pushed into every stitch iframe. Includes:
 *   - slots: keyed values for [data-slot="..."] elements
 *   - replacements: literal text-node substitutions (for unmarked hardcoded names/emails
 *     in the stitch HTML — avoids having to edit 216 files manually)
 */
meRoutes.get("/slots", async (c) => {
  const session = c.get("session");
  let user: Record<string, unknown> | null = null;
  try {
    user = await usersApi.getUserBy(tyga, { userId: session.userId });
  } catch {
    // fall back to session-only
  }

  const firstName = (user?.firstName as string) ?? "User";
  const lastName = (user?.lastName as string) ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = (user?.email as string) ?? session.email ?? "";
  const createdDate = (user?.createdDate as string | undefined) ?? (user?.createdAt as string | undefined);
  const userId = session.userId;

  const slots: Record<string, string> = {
    fullName: fullName || "User",
    firstName,
    lastName,
    email,
    userId,
    memberSince: fmtMonthYear(createdDate),
    accountType: "PERSONAL ACCOUNT",
    kycStatus: user?.isActive ? "KYC VERIFIED" : "PENDING",
    accountTier: "Plus",
    tenantName: "CRMDX",
  };

  // Map common placeholders used throughout the stitch HTML to the real user's data.
  const replacements: Record<string, string> = {
    "Joseph Obasi": fullName || "User",
    "joseph@crymadcash.io": email,
    "joseph.obasi@crymadcash.io": email,
    "Joseph": firstName,
    "Obasi": lastName,
  };

  return c.json({ slots, replacements, user });
});
