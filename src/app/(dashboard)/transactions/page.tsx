"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/components/providers/UserProvider";

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
  position: "fixed" as const,
  inset: 0,
  zIndex: 200,
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

type TabKey = "INTERNAL" | "CRYPTO" | "BANK" | "CARDS";

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
  network?: string;
  confirmations?: number;
  userId?: string;
  orderId?: string;
  externalTransactionId?: string;
}

const TAB_TO_QUERY: Record<TabKey, { walletType: string; type?: string }> = {
  INTERNAL: { walletType: "ewallet" },
  CRYPTO: { walletType: "crypto" },
  BANK: { walletType: "ewallet" },
  CARDS: { walletType: "card" },
};

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

function truncate(s: string | undefined, head = 6, tail = 4): string {
  if (!s) return "—";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function fmtDate(d?: string): string {
  if (!d) return "—";
  try { return new Date(d).toISOString().slice(0, 10); } catch { return d; }
}

function signedAmount(t: Tx): number {
  if (t.side === "debit") return -Math.abs(t.amount);
  if (t.side === "credit") return Math.abs(t.amount);
  // Fallback: if type implies debit
  if (/debit|withdraw|payout|spend|send/i.test(t.type)) return -Math.abs(t.amount);
  return Math.abs(t.amount);
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<TabKey>("INTERNAL");
  const [txns, setTxns] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [visible, setVisible] = useState(50);
  const [selected, setSelected] = useState<Tx | null>(null);

  const fetchTxns = useCallback(async (t: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      const q = TAB_TO_QUERY[t];
      const params = new URLSearchParams();
      params.set("walletType", q.walletType);
      if (q.type) params.set("type", q.type);
      params.set("limit", "500");
      const res = await fetch(`/api/transactions?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      let list: Tx[] = Array.isArray(data.transactions) ? data.transactions : [];
      // BANK tab: filter on server-unsupported bank withdrawal type client-side
      if (t === "BANK") {
        list = list.filter((x) => /bank|withdraw|wire|ach|payout/i.test(x.type));
      }
      setTxns(list);
    } catch (e) {
      setError((e as Error).message || "Failed to load transactions");
      setTxns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setVisible(50);
    fetchTxns(tab);
  }, [tab, fetchTxns]);

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return txns;
    return txns.filter(
      (t) =>
        (t.reference || "").toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q),
    );
  }, [txns, appliedSearch]);

  const isCrypto = tab === "CRYPTO";
  const shown = filtered.slice(0, visible);

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(var(--primary-rgb),0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }}>Transactions</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>View all your transaction activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["INTERNAL", "CRYPTO", "BANK", "CARDS"] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...glass,
              padding: "10px 24px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              color: tab === t ? "var(--bg)" : "var(--text-secondary)",
              background: tab === t ? "var(--primary)" : "var(--glass-bg)",
              border: tab === t ? "none" : "1px solid var(--glass-border)",
              transition: "all .2s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setAppliedSearch(search)}
          placeholder="Search by reference, id, or email…"
          style={{ ...glass, padding: "10px 16px", fontSize: 13, color: "var(--text)", flex: 1, minWidth: 200, outline: "none" }}
        />
        <button
          onClick={() => setAppliedSearch(search)}
          style={{ background: "var(--primary)", color: "var(--bg)", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Search
        </button>
        <button
          onClick={() => { setSearch(""); setAppliedSearch(""); }}
          style={{ ...glass, padding: "10px 20px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div style={{ ...glass, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ID", "Reference", "Amount", "Fee", "Email", ...(isCrypto ? ["TxHash"] : []), "Status", "Date", "Completed"].map((h) => (
                  <th key={h} style={{ ...thMono, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: isCrypto ? 9 : 8 }).map((__, j) => (
                    <td key={j} style={td}>
                      <div style={{ height: 14, borderRadius: 6, background: "rgba(148,163,184,0.12)", width: `${60 + (j * 5) % 35}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

              {!loading && error && (
                <tr>
                  <td colSpan={isCrypto ? 9 : 8} style={{ ...td, textAlign: "center", color: "var(--danger)", padding: 40 }}>
                    Failed to load transactions — {error}
                  </td>
                </tr>
              )}

              {!loading && !error && shown.map((t) => {
                const amt = signedAmount(t);
                return (
                  <tr key={t.id} style={{ cursor: "pointer", transition: "background .15s" }} onClick={() => setSelected(t)}>
                    <td style={{ ...td, ...mono, fontWeight: 600, color: "var(--primary)" }}>{truncate(t.id, 6, 4)}</td>
                    <td style={{ ...td, ...mono, fontSize: 12 }}>{t.reference || "—"}</td>
                    <td style={{ ...td, ...mono, fontWeight: 700, color: amt >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {amt >= 0 ? "+" : "-"}
                      {formatMoney(Math.abs(amt), t.currency || "USD")}
                    </td>
                    <td style={{ ...td, ...mono, fontSize: 12, color: "var(--text-secondary)" }}>
                      {t.fee != null ? formatMoney(t.fee, t.currency || "USD") : "—"}
                    </td>
                    <td style={{ ...td, fontSize: 12, color: "var(--text-secondary)" }}>{t.email || "—"}</td>
                    {isCrypto && (
                      <td style={{ ...td, ...mono, fontSize: 11 }}>
                        <span style={{ color: "var(--primary)" }}>{truncate(t.txHash, 8, 6)}</span>
                      </td>
                    )}
                    <td style={td}><StatusBadge status={t.status} /></td>
                    <td style={{ ...td, color: "var(--text-secondary)", fontSize: 12 }}>{fmtDate(t.createdDate)}</td>
                    <td style={{ ...td, color: "var(--text-secondary)", fontSize: 12 }}>{fmtDate(t.completedDate)}</td>
                  </tr>
                );
              })}

              {!loading && !error && shown.length === 0 && (
                <tr>
                  <td colSpan={isCrypto ? 9 : 8} style={{ ...td, textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 46, marginBottom: 10 }}>📭</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>No transactions found</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Your {tab.toLowerCase()} activity will appear here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Showing {shown.length} of {filtered.length} {filtered.length === 1 ? "transaction" : "transactions"}
        </span>
        {visible < filtered.length && (
          <button
            onClick={() => setVisible((v) => v + 50)}
            style={{ background: "var(--primary)", color: "var(--bg)", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Load More
          </button>
        )}
      </div>

      {selected && <TxDetailModal tx={selected} onClose={() => setSelected(null)} isCrypto={isCrypto} />}
    </>
  );
}

function TxDetailModal({ tx, onClose, isCrypto }: { tx: Tx; onClose: () => void; isCrypto: boolean }) {
  const amt = signedAmount(tx);
  const sk = statusKey(tx.status);
  const steps = [
    { label: "Created", done: true, date: tx.createdDate },
    { label: "Processing", done: sk !== "muted" && !/^(created|queued)$/i.test(tx.status), date: undefined },
    { label: "Confirmed", done: sk === "success" || /confirmed/i.test(tx.status), date: undefined },
    { label: "Complete", done: sk === "success", date: tx.completedDate },
  ];
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...glass, maxWidth: 620, width: "92%", padding: 32, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Transaction Details</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <Field label="ID" value={tx.id} mono />
          <Field label="Reference" value={tx.reference || "—"} mono />
          <Field label="Type" value={tx.type} />
          <Field
            label="Amount"
            value={`${amt >= 0 ? "+" : "-"}${formatMoney(Math.abs(amt), tx.currency || "USD")}`}
            mono
            color={amt >= 0 ? "var(--success)" : "var(--danger)"}
          />
          <Field label="Fee" value={tx.fee != null ? formatMoney(tx.fee, tx.currency || "USD") : "—"} mono />
          <Field label="Currency" value={tx.currency || "USD"} mono />
          <div>
            <Label>Status</Label>
            <StatusBadge status={tx.status} />
          </div>
          <Field label="Wallet" value={tx.walletType || "—"} />
          <Field label="Created" value={fmtDate(tx.createdDate)} />
          <Field label="Completed" value={fmtDate(tx.completedDate)} />
        </div>

        {(tx.email || tx.userId || tx.orderId || tx.externalTransactionId) && (
          <div style={{ ...glass, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {tx.email && <Field label="Email" value={tx.email} />}
              {tx.userId && <Field label="User ID" value={tx.userId} mono />}
              {tx.orderId && <Field label="Order ID" value={tx.orderId} mono />}
              {tx.externalTransactionId && <Field label="External ID" value={tx.externalTransactionId} mono />}
            </div>
          </div>
        )}

        {isCrypto && (tx.txHash || tx.network || tx.confirmations != null) && (
          <div style={{ ...glass, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {tx.txHash && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Transaction Hash</Label>
                  <div style={{ ...mono, fontSize: 12, color: "var(--primary)", wordBreak: "break-all" }}>
                    {tx.txHash}
                  </div>
                </div>
              )}
              {tx.network && <Field label="Network" value={tx.network} />}
              {tx.confirmations != null && <Field label="Confirmations" value={String(tx.confirmations)} mono />}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Status Timeline</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: step.done ? "var(--primary)" : "var(--glass-bg)",
                    border: step.done ? "none" : "2px solid var(--glass-border)",
                  }}
                >
                  {step.done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)" }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: step.done ? "var(--primary)" : "var(--text-muted)", fontWeight: 700 }}>{step.label}</div>
                {step.date && <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{fmtDate(step.date)}</div>}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: steps[i + 1].done ? "var(--primary)" : "var(--glass-border)", margin: "15px 4px 0" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{children}</div>;
}

function Field({ label, value, mono: useMono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ ...(useMono ? mono : {}), fontWeight: 600, color: color || "var(--text)", fontSize: 13, wordBreak: "break-all" }}>
        {value}
      </div>
    </div>
  );
}
