"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/providers/UserProvider";

interface Tx {
  id: string;
  type: string;
  amount: number;
  currency?: string;
  userId?: string;
  email?: string;
  reference?: string;
  externalTransactionId?: string;
  createdDate: string;
  status?: string;
}

type Tab = "PAYOUTS" | "DEBITS" | "HISTORY";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const mono: React.CSSProperties = { fontFamily: "ui-monospace, Menlo, monospace" };

function fmtPts(n: number): string {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} pts`;
}

export default function RewardsPage() {
  const { walletsByType } = useUser();
  const rewardsWallet = walletsByType.rewards;

  const [tab, setTab] = useState<Tab>("PAYOUTS");
  const [payouts, setPayouts] = useState<Tx[]>([]);
  const [debits, setDebits] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [debitOpen, setDebitOpen] = useState(false);
  const [refundFor, setRefundFor] = useState<Tx | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([
        fetch("/api/transactions?type=reward_payout").then((r) => r.json()),
        fetch("/api/transactions?type=reward_debit").then((r) => r.json()),
      ]);
      setPayouts(Array.isArray(p.transactions) ? p.transactions : []);
      setDebits(Array.isArray(d.transactions) ? d.transactions : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const history = useMemo(() => {
    return [...payouts, ...debits].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
  }, [payouts, debits]);

  const tabData = tab === "PAYOUTS" ? payouts : tab === "DEBITS" ? debits : history;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(var(--primary-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5"/></svg>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--text)" }}>Rewards</h1>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: 13 }}>
            Issue, debit, and track rewards points for your users.
          </p>
        </div>
      </div>

      <div style={{ ...glass, padding: 24, marginBottom: 20, background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.15), rgba(var(--primary-rgb),0.02))" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>
          {rewardsWallet?.name || "Rewards Wallet"}
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "var(--primary)", ...mono, marginTop: 6 }}>
          {fmtPts(rewardsWallet?.balance ?? 0)}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {rewardsWallet?.balanceLocked ? `${fmtPts(rewardsWallet.balanceLocked)} locked` : "Available for issuance"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div style={{ ...glass, padding: 6, display: "inline-flex", gap: 4 }}>
          {(["PAYOUTS", "DEBITS", "HISTORY"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: active ? "var(--primary)" : "transparent",
                  color: active ? "var(--bg)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {tab === "PAYOUTS" && (
            <>
              <button onClick={() => setBatchOpen(true)} style={ghostBtn}>Batch Rewards</button>
              <button onClick={() => setIssueOpen(true)} style={primaryBtn}>+ Issue Reward</button>
            </>
          )}
          {tab === "DEBITS" && (
            <button onClick={() => setDebitOpen(true)} style={primaryBtn}>– Debit Reward</button>
          )}
        </div>
      </div>

      <div style={{ ...glass, padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : tabData.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18 }}>No records yet</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Reward activity will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(var(--primary-rgb), 0.04)" }}>
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>User</Th>
                  <Th style={{ textAlign: "right" }}>Amount</Th>
                  <Th>Reference</Th>
                  <Th>Date</Th>
                  {tab === "DEBITS" && <Th>Action</Th>}
                </tr>
              </thead>
              <tbody>
                {tabData.map((t) => (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--glass-border)" }}>
                    <Td><span style={{ ...mono, fontSize: 12, color: "var(--text-secondary)" }}>{String(t.id).slice(0, 10)}…</span></Td>
                    <Td>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        padding: "3px 8px", borderRadius: 6,
                        color: t.type?.includes("debit") ? "var(--danger)" : "var(--success)",
                        background: t.type?.includes("debit")
                          ? "color-mix(in srgb, var(--danger) 15%, transparent)"
                          : "color-mix(in srgb, var(--success) 15%, transparent)",
                      }}>
                        {t.type?.replace("reward_", "").toUpperCase() || "—"}
                      </span>
                    </Td>
                    <Td>{t.email || t.userId || "—"}</Td>
                    <Td style={{ textAlign: "right", ...mono }}>{fmtPts(t.amount)}</Td>
                    <Td>{t.reference || t.externalTransactionId || "—"}</Td>
                    <Td>{new Date(t.createdDate).toLocaleDateString()}</Td>
                    {tab === "DEBITS" && (
                      <Td>
                        <button onClick={() => setRefundFor(t)} style={smallPrimary}>Refund</button>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {issueOpen && <IssueModal onClose={() => setIssueOpen(false)} onSuccess={load} />}
      {batchOpen && <BatchModal onClose={() => setBatchOpen(false)} onSuccess={load} />}
      {debitOpen && <DebitModal onClose={() => setDebitOpen(false)} onSuccess={load} />}
      {refundFor && <RefundModal tx={refundFor} onClose={() => setRefundFor(null)} onSuccess={load} />}
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6, ...style }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text)", ...style }}>{children}</td>;
}

function IssueModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ userId: "", amount: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/rewards/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          amount: Number(form.amount),
          description: form.description || undefined,
          externalTransactionId: `rw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      onSuccess(); onClose();
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal onClose={onClose} title="Issue Reward">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Recipient User ID"><input required style={inputStyle} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} /></Field>
        <Field label="Amount (points)"><input required type="number" step="0.01" min="0.01" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Description"><input style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        {err && <div style={{ color: "var(--danger)", fontSize: 12 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1, opacity: busy ? 0.6 : 1 }}>{busy ? "Issuing…" : "Issue Reward"}</button>
        </div>
      </form>
    </Modal>
  );
}

function BatchModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function run() {
    setBusy(true); setMsg(null);
    const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
    const payouts = lines.map((l, i) => {
      const [userId, amount, description] = l.split(",").map((s) => s.trim());
      return { userId, amount: Number(amount), description, externalTransactionId: `rwbatch_${Date.now()}_${i}` };
    });
    try {
      const res = await fetch("/api/rewards/batch-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payouts }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setMsg(`Submitted ${payouts.length} rewards.`);
      onSuccess();
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal onClose={onClose} title="Batch Rewards">
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 12px" }}>
        Paste one reward per line: <code>userId,amount,description</code>
      </p>
      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8}
        style={{ ...inputStyle, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, resize: "vertical" }}
        placeholder="abc123,100,Signup bonus" />
      {msg && <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)" }}>{msg}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Close</button>
        <button onClick={run} disabled={busy || !csv.trim()} style={{ ...primaryBtn, flex: 1, opacity: busy || !csv.trim() ? 0.6 : 1 }}>{busy ? "Processing…" : "Run Batch"}</button>
      </div>
    </Modal>
  );
}

function DebitModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ userId: "", amount: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/rewards/debit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: form.userId, amount: Number(form.amount), reason: form.reason || undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      onSuccess(); onClose();
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal onClose={onClose} title="Debit Reward">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="User ID"><input required style={inputStyle} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} /></Field>
        <Field label="Amount (points)"><input required type="number" step="0.01" min="0.01" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Reason"><input style={inputStyle} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
        {err && <div style={{ color: "var(--danger)", fontSize: 12 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1, opacity: busy ? 0.6 : 1 }}>{busy ? "Debiting…" : "Debit Reward"}</button>
        </div>
      </form>
    </Modal>
  );
}

function RefundModal({ tx, onClose, onSuccess }: { tx: Tx; onClose: () => void; onSuccess: () => void }) {
  const [extId, setExtId] = useState(`refund_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/rewards/debit/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id, externalTransactionId: extId, description: desc || undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      onSuccess(); onClose();
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal onClose={onClose} title="Refund Reward Debit">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Refunding debit <code style={mono}>{tx.id}</code>
        </div>
        <Field label="External Transaction ID"><input required style={inputStyle} value={extId} onChange={(e) => setExtId(e.target.value)} /></Field>
        <Field label="Description"><input style={inputStyle} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        {err && <div style={{ color: "var(--danger)", fontSize: 12 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1, opacity: busy ? 0.6 : 1 }}>{busy ? "Refunding…" : "Confirm Refund"}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...glass, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
const primaryBtn: React.CSSProperties = { background: "var(--primary)", color: "var(--bg)", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const ghostBtn: React.CSSProperties = { background: "transparent", color: "var(--text)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const smallPrimary: React.CSSProperties = { background: "var(--primary)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" };
