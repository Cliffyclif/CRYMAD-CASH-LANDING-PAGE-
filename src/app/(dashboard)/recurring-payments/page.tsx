"use client";

import { useEffect, useState } from "react";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const CYCLES = [
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Bi-weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "annual", label: "Annual" },
];

const WALLET_TYPES = [
  { id: "ewallet", label: "E-Wallet" },
  { id: "crypto", label: "Crypto" },
];

export default function RecurringPaymentsPage() {
  const [note, setNote] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/recurring-payments");
        const j = await res.json();
        if (j.note) setNote(j.note);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(var(--primary-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--text)" }}>Recurring Payments</h1>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: 13 }}>
              Automate payouts on a schedule you choose.
            </p>
          </div>
        </div>
        <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ Create Recurring Payment</button>
      </div>

      <div style={{ ...glass, padding: 60, textAlign: "center" }}>
        <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 18px", display: "block", opacity: 0.7 }}>
          <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 20, color: "var(--text)", fontWeight: 700 }}>Set up your first recurring payment</h2>
        <p style={{ color: "var(--text-muted)", margin: "10px auto 24px", fontSize: 14, maxWidth: 460 }}>
          Schedule automatic payouts to recipients on a weekly, monthly, or custom cadence.
          {note ? ` ${note}` : ""}
        </p>
        <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ Create Recurring Payment</button>
      </div>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    userId: "", amount: "", paymentCycleId: "monthly",
    walletType: "ewallet", startDate: "", endDate: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/recurring-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          amount: Number(form.amount),
          paymentCycleId: form.paymentCycleId,
          paymentId: `rp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          walletType: form.walletType,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setOk(true);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...glass, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Create Recurring Payment</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: 22 }}>
          {ok ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
              <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Recurring payment created.</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
                It will be visible once the provider adds listing support.
              </div>
              <button onClick={onClose} style={primaryBtn}>Done</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Recipient User ID"><input required style={inputStyle} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Amount"><input required type="number" step="0.01" min="0.01" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
                <Field label="Cycle">
                  <select style={inputStyle} value={form.paymentCycleId} onChange={(e) => setForm({ ...form, paymentCycleId: e.target.value })}>
                    {CYCLES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Wallet Type">
                <select style={inputStyle} value={form.walletType} onChange={(e) => setForm({ ...form, walletType: e.target.value })}>
                  {WALLET_TYPES.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Start Date"><input required type="date" style={inputStyle} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
                <Field label="End Date (optional)"><input type="date" style={inputStyle} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
              </div>
              {err && <div style={{ color: "var(--danger)", fontSize: 12 }}>{err}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
                <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1, opacity: busy ? 0.6 : 1 }}>{busy ? "Creating…" : "Create"}</button>
              </div>
            </form>
          )}
        </div>
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
