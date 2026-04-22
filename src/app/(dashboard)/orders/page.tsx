"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/components/providers/UserProvider";
import { useLanguage } from "@/i18n/LanguageContext";

const glass = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
} as const;

const thMono = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: 1,
  color: "var(--text-muted)",
  background: "rgba(var(--primary-rgb),0.04)",
};

const td = { padding: "14px 16px", borderBottom: "1px solid var(--glass-border)" } as const;
const mono = { fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" } as const;
const overlay = {
  position: "fixed" as const, inset: 0, zIndex: 200,
  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center" as const, justifyContent: "center" as const,
};

type TabKey = "PENDING" | "COMPLETED";

interface Tx {
  id: string;
  status: string;
  type: string;
  side?: "credit" | "debit";
  amount: number;
  fee?: number;
  currency?: string;
  walletType?: string;
  reference?: string;
  email?: string;
  createdDate: string;
  completedDate?: string;
  orderId?: string;
}

function statusKey(s: string): "success" | "warn" | "danger" | "muted" {
  const x = (s || "").toLowerCase();
  if (/(complete|success|confirmed|approved|paid)/.test(x)) return "success";
  if (/(pending|processing|awaiting|submitted)/.test(x)) return "warn";
  if (/(fail|error|reject|cancel|decline|refund)/.test(x)) return "danger";
  return "muted";
}

function StatusBadge({ status }: { status: string }) {
  const k = statusKey(status);
  const colors = {
    success: { bg: "rgba(34,197,94,0.12)", fg: "var(--success)" },
    warn: { bg: "rgba(245,158,11,0.12)", fg: "var(--warning)" },
    danger: { bg: "rgba(239,68,68,0.12)", fg: "var(--danger)" },
    muted: { bg: "rgba(148,163,184,0.12)", fg: "var(--text-muted)" },
  }[k];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600,
      background: colors.bg, color: colors.fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.fg }} />
      {status || "—"}
    </span>
  );
}

function fmtDate(d?: string): string {
  if (!d) return "—";
  try { return new Date(d).toISOString().slice(0, 10); } catch { return d; }
}

function truncate(s: string | undefined, head = 6, tail = 4): string {
  if (!s) return "—";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export default function OrdersPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<TabKey>("PENDING");
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<Record<string, unknown> | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions?walletType=ewallet&type=order&limit=500", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (e) {
      setError((e as Error).message || "Failed to load orders");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const k = statusKey(r.status);
      if (tab === "PENDING") return k === "warn" || k === "muted";
      return k === "success" || k === "danger";
    });
  }, [rows, tab]);

  const runLookup = async () => {
    const id = lookupId.trim();
    if (!id) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.details?.message || data?.error || `Request failed (${res.status})`);
      }
      setLookupResult(data.order as Record<string, unknown>);
    } catch (e) {
      setLookupError((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(var(--primary-rgb),0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }}>{t("app.orders.title")}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Track your payment orders</p>
        </div>
      </div>

      {/* Order Lookup Card */}
      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Order Lookup</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
          Enter an order ID to fetch its full details.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runLookup()}
            placeholder="e.g. 8Hm3k9…"
            style={{ ...glass, ...mono, padding: "10px 16px", fontSize: 13, color: "var(--text)", flex: 1, minWidth: 240, outline: "none" }}
          />
          <button
            onClick={runLookup}
            disabled={!lookupId.trim() || lookupLoading}
            style={{
              background: "var(--primary)", color: "var(--bg)", border: "none",
              borderRadius: 12, padding: "10px 20px", fontSize: 12, fontWeight: 700,
              cursor: lookupLoading ? "wait" : "pointer", opacity: !lookupId.trim() ? 0.6 : 1,
            }}
          >
            {lookupLoading ? "Looking up…" : "Look Up"}
          </button>
        </div>
        {lookupError && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--danger)" }}>{lookupError}</div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["PENDING", "COMPLETED"] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...glass,
              padding: "10px 24px", fontSize: 12, fontWeight: 700, letterSpacing: 1,
              cursor: "pointer",
              color: tab === t ? "var(--bg)" : "var(--text-secondary)",
              background: tab === t ? "var(--primary)" : "var(--glass-bg)",
              border: tab === t ? "none" : "1px solid var(--glass-border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...glass, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ID", "Reference", "Type", "Amount", "Status", "Created", "Completed"].map((h) => (
                  <th key={h} style={{ ...thMono, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} style={td}>
                      <div style={{ height: 14, borderRadius: 6, background: "rgba(148,163,184,0.12)", width: `${50 + (j * 7) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

              {!loading && error && (
                <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "var(--danger)", padding: 40 }}>Failed to load orders — {error}</td></tr>
              )}

              {!loading && !error && filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ ...td, ...mono, fontWeight: 600, color: "var(--primary)" }}>{truncate(o.id, 6, 4)}</td>
                  <td style={{ ...td, ...mono, fontSize: 12 }}>{o.reference || "—"}</td>
                  <td style={{ ...td, fontSize: 12, color: "var(--text-secondary)" }}>{o.type}</td>
                  <td style={{ ...td, ...mono, fontWeight: 700, color: "var(--text)" }}>
                    {formatMoney(Math.abs(o.amount), o.currency || "USD")}
                  </td>
                  <td style={td}><StatusBadge status={o.status} /></td>
                  <td style={{ ...td, color: "var(--text-secondary)", fontSize: 12 }}>{fmtDate(o.createdDate)}</td>
                  <td style={{ ...td, color: "var(--text-secondary)", fontSize: 12 }}>{fmtDate(o.completedDate)}</td>
                </tr>
              ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...td, textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 46, marginBottom: 10 }}>🧾</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{t("app.orders.empty")}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("app.orders.emptyBody")}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lookupResult && <OrderLookupModal order={lookupResult} onClose={() => setLookupResult(null)} />}
    </>
  );
}

function OrderLookupModal({ order, onClose }: { order: Record<string, unknown>; onClose: () => void }) {
  const entries = Object.entries(order).filter(([, v]) => typeof v !== "object" || v === null);
  const objectEntries = Object.entries(order).filter(([, v]) => typeof v === "object" && v !== null);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...glass, maxWidth: 640, width: "92%", padding: 32, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Order Details</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {entries.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{k}</div>
              <div style={{ ...mono, fontWeight: 600, color: "var(--text)", fontSize: 13, wordBreak: "break-all" }}>
                {v === null || v === undefined ? "—" : String(v)}
              </div>
            </div>
          ))}
        </div>

        {objectEntries.map(([k, v]) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{k}</div>
            <pre style={{ ...mono, ...glass, padding: 12, fontSize: 11, color: "var(--text-secondary)", margin: 0, overflowX: "auto" }}>
              {JSON.stringify(v, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
