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
  txHash?: string;
}

const TX_TYPES = [
  { label: "All Types", value: "" },
  { label: "Payout", value: "payout" },
  { label: "Debit", value: "debit" },
  { label: "Credit", value: "credit" },
  { label: "Transfer", value: "transfer" },
  { label: "Order", value: "order" },
  { label: "Swap", value: "swap" },
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdrawal" },
];

const WALLET_TYPES = [
  { label: "All Wallets", value: "" },
  { label: "E-Wallet", value: "ewallet" },
  { label: "Crypto", value: "crypto" },
  { label: "Card", value: "card" },
  { label: "Rewards", value: "rewards" },
];

function statusKey(s: string): "success" | "warn" | "danger" | "muted" {
  const x = (s || "").toLowerCase();
  if (/(complete|success|confirmed|approved|paid)/.test(x)) return "success";
  if (/(pending|processing|awaiting|submitted)/.test(x)) return "warn";
  if (/(fail|error|reject|cancel|decline)/.test(x)) return "danger";
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

function signedAmount(t: Tx): number {
  if (t.side === "debit") return -Math.abs(t.amount);
  if (t.side === "credit") return Math.abs(t.amount);
  if (/debit|withdraw|payout|spend|send/i.test(t.type)) return -Math.abs(t.amount);
  return Math.abs(t.amount);
}

function todayIso(): string { return new Date().toISOString().slice(0, 10); }
function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<string>(daysAgoIso(30));
  const [endDate, setEndDate] = useState<string>(todayIso());
  const [txType, setTxType] = useState<string>("");
  const [walletType, setWalletType] = useState<string>("");

  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (txType) params.set("type", txType);
      if (walletType) params.set("walletType", walletType);
      params.set("limit", "1000");
      const res = await fetch(`/api/transactions?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data.transactions) ? data.transactions : []);
      setRan(true);
    } catch (e) {
      setError((e as Error).message || "Failed to generate report");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, txType, walletType]);

  // Auto-run once on mount with defaults
  useEffect(() => { fetchReport(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const summary = useMemo(() => {
    let inflow = 0, outflow = 0;
    for (const r of rows) {
      const a = signedAmount(r);
      if (a >= 0) inflow += a; else outflow += a;
    }
    return { inflow, outflow, net: inflow + outflow, count: rows.length };
  }, [rows]);

  const exportCsv = () => {
    const header = ["ID", "Reference", "Type", "Wallet", "Amount", "Fee", "Currency", "Status", "Email", "Created", "Completed"];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        r.id, r.reference || "", r.type, r.walletType || "",
        signedAmount(r).toFixed(2), (r.fee ?? 0).toFixed(2), r.currency || "USD",
        r.status, r.email || "", r.createdDate, r.completedDate || "",
      ].map(esc).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(var(--primary-rgb),0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 15l4-4 4 4 5-5" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }}>{t("app.reports.title")}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{t("app.reports.subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Start Date</div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ ...glass, padding: "10px 14px", fontSize: 13, color: "var(--text)", width: "100%", outline: "none" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>End Date</div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ ...glass, padding: "10px 14px", fontSize: 13, color: "var(--text)", width: "100%", outline: "none" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Transaction Type</div>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              style={{ ...glass, padding: "10px 14px", fontSize: 13, color: "var(--text)", width: "100%", outline: "none", cursor: "pointer" }}
            >
              {TX_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Wallet Type</div>
            <select
              value={walletType}
              onChange={(e) => setWalletType(e.target.value)}
              style={{ ...glass, padding: "10px 14px", fontSize: 13, color: "var(--text)", width: "100%", outline: "none", cursor: "pointer" }}
            >
              {WALLET_TYPES.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={fetchReport}
            disabled={loading}
            style={{
              background: "var(--primary)", color: "var(--bg)", border: "none",
              borderRadius: 12, padding: "10px 22px", fontSize: 12, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? t("app.reports.generating") : t("app.reports.generate")}
          </button>
          <button
            onClick={exportCsv}
            disabled={!ran || rows.length === 0}
            style={{
              ...glass, padding: "10px 22px", fontSize: 12, fontWeight: 700,
              cursor: !ran || rows.length === 0 ? "not-allowed" : "pointer",
              color: "var(--text)", opacity: !ran || rows.length === 0 ? 0.5 : 1,
            }}
          >
            {t("app.reports.exportCsv")}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <SummaryCard label={t("app.reports.totalInflow")} value={`+${formatMoney(summary.inflow)}`} color="var(--success)" />
        <SummaryCard label={t("app.reports.totalOutflow")} value={`${summary.outflow < 0 ? "-" : ""}${formatMoney(Math.abs(summary.outflow))}`} color="var(--danger)" />
        <SummaryCard label={t("app.reports.netBalance")} value={`${summary.net >= 0 ? "+" : "-"}${formatMoney(Math.abs(summary.net))}`} color={summary.net >= 0 ? "var(--success)" : "var(--danger)"} />
        <SummaryCard label={t("app.reports.count")} value={String(summary.count)} color="var(--text)" />
      </div>

      {/* Table */}
      <div style={{ ...glass, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Type", "Wallet", "Reference", "Amount", "Fee", "Status"].map((h) => (
                  <th key={h} style={{ ...thMono, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} style={td}>
                      <div style={{ height: 14, borderRadius: 6, background: "rgba(148,163,184,0.12)", width: `${50 + (j * 9) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

              {!loading && error && (
                <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "var(--danger)", padding: 40 }}>Failed to generate report — {error}</td></tr>
              )}

              {!loading && !error && rows.map((r) => {
                const amt = signedAmount(r);
                return (
                  <tr key={r.id}>
                    <td style={{ ...td, fontSize: 12, color: "var(--text-secondary)" }}>{fmtDate(r.createdDate)}</td>
                    <td style={{ ...td, fontSize: 12, color: "var(--text)" }}>{r.type}</td>
                    <td style={{ ...td, fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{r.walletType || "—"}</td>
                    <td style={{ ...td, ...mono, fontSize: 12 }}>{r.reference || "—"}</td>
                    <td style={{ ...td, ...mono, fontWeight: 700, color: amt >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {amt >= 0 ? "+" : "-"}{formatMoney(Math.abs(amt), r.currency || "USD")}
                    </td>
                    <td style={{ ...td, ...mono, fontSize: 12, color: "var(--text-secondary)" }}>
                      {r.fee != null ? formatMoney(r.fee, r.currency || "USD") : "—"}
                    </td>
                    <td style={td}><StatusBadge status={r.status} /></td>
                  </tr>
                );
              })}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...td, textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 46, marginBottom: 10 }}>📊</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>No results</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Try widening your date range or changing filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ ...glass, padding: 20 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ ...mono, fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
