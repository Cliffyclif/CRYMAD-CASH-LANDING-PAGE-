"use client";

/**
 * UserProvider — wraps the dashboard tree.
 * Fetches /api/auth/me once and exposes it via context.
 * Every page that needs user data uses useUser().
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Wallet = {
  id: string;
  type: "ewallet" | "crypto" | "card" | "rewards";
  userId: string;
  name: string;
  currency: string;
  balance: number;
  balanceLocked: number;
  pendingPayouts: number;
  totalPayouts: number;
  createdDate: string;
  modifiedDate: string;
};

export type User = {
  id: string;
  email: string;
  accountType: "individual" | "business";
  tygapayUserId: string;
  firstName?: string;
  lastName?: string;
  kycStatus: "not_started" | "pending" | "approved" | "rejected";
  emailVerified: boolean;
  completedRegistration: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  lastLoginAt?: string | null;
};

interface Ctx {
  user: User | null;
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fullName: string;
  initials: string;
  primaryWallet: Wallet | null;
  walletsByType: Partial<Record<Wallet["type"], Wallet>>;
}

const UserContext = createContext<Ctx | null>(null);

export function useUser(): Ctx {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) {
        setUser(null);
        setWallets([]);
        return;
      }
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setUser(json.user);
      setWallets(json.wallets ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<Ctx>(() => {
    const first = user?.firstName ?? "";
    const last = user?.lastName ?? "";
    const fullName = `${first} ${last}`.trim() || user?.email?.split("@")[0] || "";
    const initials =
      (first?.[0] ?? "").toUpperCase() + (last?.[0] ?? "").toUpperCase() ||
      (user?.email?.[0] ?? "").toUpperCase();

    const byType: Ctx["walletsByType"] = {};
    for (const w of wallets) byType[w.type] = w;

    return {
      user,
      wallets,
      loading,
      error,
      refresh,
      fullName,
      initials: initials || "?",
      primaryWallet: byType.ewallet ?? wallets[0] ?? null,
      walletsByType: byType,
    };
  }, [user, wallets, loading, error, refresh]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/** Currency formatter — respects the wallet currency. */
export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
