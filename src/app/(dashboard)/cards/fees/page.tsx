"use client";

import { useEffect, useMemo, useState } from "react";

type FeeRow = {
  name?: string;
  label?: string;
  amount?: number | string;
  currency?: string;
  description?: string;
  category?: string;
  [key: string]: unknown;
};

type CategoryKey = "ORDER" | "LOAD" | "TRANSACTION" | "OTHER";

const CATEGORY_META: Record<CategoryKey, { label: string; icon: React.ReactNode; match: RegExp }> = {
  ORDER: {
    label: "Order Fees",
    icon: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
    match: /order|issuance|ship|deliver|replace|express|card$/i,
  },
  LOAD: {
    label: "Load Fees",
    icon: <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
    match: /load|top[-\s]?up|deposit|fund|wallet|transfer$/i,
  },
  TRANSACTION: {
    label: "Transaction Fees",
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h18M10 3v18" /></>,
    match: /transaction|purchase|atm|withdraw|currency|fx|conversion|swap/i,
  },
  OTHER: {
    label: "Other Fees",
    icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
    match: /.*/,
  },
};

const FALLBACK: Record<CategoryKey, FeeRow[]> = {
  ORDER: [
    { name: "Virtual Card", amount: 0, description: "Instant digital activation" },
    { name: "Physical Card", amount: 9.99, description: "Standard delivery (7-10 days)" },
    { name: "Replacement Card", amount: 14.99, description: "Lost or stolen hardware replacement" },
    { name: "Express Shipping", amount: 24.99, description: "Global courier (2-3 business days)" },
  ],
  LOAD: [
    { name: "Wallet to Card", amount: "Free", description: "Instant internal transfer" },
    { name: "Bank Transfer", amount: "0.5%", description: "SEPA / Swift local deposits" },
    { name: "Crypto Top-up", amount: "1.0%", description: "Network conversion fee" },
    { name: "International", amount: "2.5%", description: "Cross-border wire transfer" },
  ],
  TRANSACTION: [
    { name: "Domestic Purchase", amount: "0.00%", description: "Merchant payments within region" },
    { name: "International Purchase", amount: "2.00%", description: "Foreign merchant transactions" },
    { name: "ATM Withdrawal", amount: 2.5, description: "Per transaction plus 3rd party fees" },
    { name: "Currency Conversion", amount: "1.25%", description: "FX market spread adjustment" },
  ],
  OTHER: [
    { name: "Monthly Maintenance", amount: 0, description: "No subscription required" },
    { name: "Statement Copy", amount: 5, description: "Mailed physical documentation" },
    { name: "Chargeback", amount: 25, description: "Disputed transaction fee" },
    { name: "Account Closure", amount: "Free", description: "Termination of services" },
  ],
};

function fmt(r: FeeRow): string {
  const a = r.amount;
  if (typeof a === "number") return a === 0 ? "$0.00" : `$${a.toFixed(2)}`;
  if (typeof a === "string") return a;
  return "—";
}

function classify(r: FeeRow): CategoryKey {
  const key = String(r.category || r.name || r.label || "").toLowerCase();
  if (CATEGORY_META.ORDER.match.test(key)) return "ORDER";
  if (CATEGORY_META.LOAD.match.test(key)) return "LOAD";
  if (CATEGORY_META.TRANSACTION.match.test(key)) return "TRANSACTION";
  return "OTHER";
}

export default function CardFeesPage() {
  const [apiData, setApiData] = useState<FeeRow[] | null>(null);
  const [active, setActive] = useState<CategoryKey | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    fetch("/api/cards/fees")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || String(r.status));
        const flat: FeeRow[] = Array.isArray(j.fees)
          ? j.fees
          : typeof j.fees === "object" && j.fees !== null
            ? Object.entries(j.fees).flatMap(([k, v]) =>
                Array.isArray(v) ? v.map((r) => ({ ...(r as FeeRow), category: k })) : []
              )
            : [];
        if (flat.length > 0) {
          setApiData(flat);
          setIsFallback(false);
        } else {
          setApiData(null);
          setIsFallback(true);
        }
      })
      .catch(() => {
        setApiData(null);
        setIsFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const base: Record<CategoryKey, FeeRow[]> = { ORDER: [], LOAD: [], TRANSACTION: [], OTHER: [] };
    if (apiData && apiData.length > 0) {
      for (const r of apiData) base[classify(r)].push(r);
      for (const k of Object.keys(base) as CategoryKey[]) {
        if (base[k].length === 0) base[k] = FALLBACK[k];
      }
    } else {
      for (const k of Object.keys(FALLBACK) as CategoryKey[]) base[k] = FALLBACK[k];
    }
    return base;
  }, [apiData]);

  const filters: Array<"ALL" | CategoryKey> = ["ORDER", "LOAD", "TRANSACTION", "OTHER"];
  const visible = active === "ALL" ? filters.filter((f) => f !== "ALL") as CategoryKey[] : [active];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{
        color: "var(--primary)", fontSize: 40, fontWeight: 800, margin: "0 0 8px",
        letterSpacing: -0.5, textShadow: "0 0 30px rgba(var(--primary-rgb), 0.35)",
      }}>Fee Schedule</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 20px", maxWidth: 480, lineHeight: 1.5 }}>
        Transparent pricing. Engineered for high-frequency financial fluidity.
      </p>

      {isFallback && !loading && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--warning)" }}>Sample fees shown.</strong>{" "}
            Your fee schedule hasn&apos;t been provisioned yet.
            The numbers below are illustrative — contact support for actual pricing.
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const isActive = active === f || (active === "ALL" && f === "ORDER");
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              style={{
                padding: "7px 18px", borderRadius: 24,
                background: isActive ? "rgba(var(--primary-rgb), 0.15)" : "transparent",
                border: `1px solid ${isActive ? "var(--primary)" : "var(--glass-border)"}`,
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}
            >{f}</button>
          );
        })}
      </div>

      {loading && <div style={{
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        borderRadius: 18, padding: 40, textAlign: "center", color: "var(--text-muted)", marginBottom: 16,
      }}>Loading fees…</div>}

      {!loading && visible.map((cat) => {
        const meta = CATEGORY_META[cat];
        const rows = grouped[cat];
        return (
          <div key={cat} style={{
            background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            borderRadius: 18, padding: 24, marginBottom: 18,
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(var(--primary-rgb), 0.12)",
                border: "1px solid rgba(var(--primary-rgb), 0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {meta.icon}
                </svg>
              </div>
              <h3 style={{
                color: "var(--text)", margin: 0, fontSize: 16, fontWeight: 800,
                letterSpacing: 1.5, textTransform: "uppercase",
              }}>{meta.label.toUpperCase()}</h3>
            </div>

            {/* Header row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "0 2px 12px", fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
              color: "var(--text-muted)", textTransform: "uppercase",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div>Fee Type</div>
              <div style={{ textAlign: "center" }}>Amount</div>
              <div style={{ textAlign: "right" }}>Description</div>
            </div>

            {/* Rows */}
            {rows.map((r, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                padding: "14px 2px", alignItems: "center",
                borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                fontSize: 13,
              }}>
                <div style={{ color: "var(--text)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {r.name || r.label || "—"}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div style={{
                  textAlign: "center", color: "var(--primary)",
                  fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14,
                }}>{fmt(r)}</div>
                <div style={{
                  textAlign: "right", color: "var(--text-muted)", fontSize: 12,
                }}>{r.description || "—"}</div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Support Banner */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        padding: "18px 22px", borderRadius: 18,
        background: "linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.02))",
        border: "1px solid rgba(var(--primary-rgb), 0.3)",
        borderLeft: "3px solid var(--primary)",
        marginTop: 24,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase", marginBottom: 4 }}>Need Help?</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Our support team is available 24/7 for fee inquiries.</div>
        </div>
        <a href="/help" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 24,
          background: "transparent", border: "1px solid var(--primary)",
          color: "var(--primary)", fontSize: 11, fontWeight: 700,
          letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", fontFamily: "inherit",
          boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.15)",
        }}>
          Contact Support
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </div>
  );
}
