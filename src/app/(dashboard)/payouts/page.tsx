"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/components/providers/UserProvider";
import { useLanguage } from "@/i18n/LanguageContext";

type Status = "PENDING APPROVAL" | "PROCESSING" | "COMPLETED" | "CANCELLED";

interface Payout {
  id: string;
  status?: string;
  recipientUserId?: string;
  userId?: string;
  email?: string;
  amount: number;
  currency?: string;
  reference?: string;
  externalTransactionId?: string;
  createdDate: string;
}

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const mono: React.CSSProperties = { fontFamily: "ui-monospace, Menlo, monospace" };

function statusOf(p: Payout): Status {
  const s = (p.status || "").toLowerCase();
  if (s.includes("cancel") || s.includes("reject")) return "CANCELLED";
  if (s.includes("complete") || s.includes("success") || s === "settled") return "COMPLETED";
  if (s.includes("pend") || s.includes("await") || s.includes("approval")) return "PENDING APPROVAL";
  return "PROCESSING";
}

function badge(status: Status): React.CSSProperties {
  const c =
    status === "COMPLETED" ? "var(--success)"
    : status === "CANCELLED" ? "var(--danger)"
    : status === "PROCESSING" ? "var(--primary)"
    : "var(--warning)";
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: c,
    background: `color-mix(in srgb, ${c} 15%, transparent)`,
    letterSpacing: 0.4,
  };
}

const TABS: Status[] = ["PENDING APPROVAL", "PROCESSING", "COMPLETED", "CANCELLED"];
const CURRENCIES = ["USD", "EUR", "JPY", "CAD"];

export default function PayoutsPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Status>("PENDING APPROVAL");
  const [rows, setRows] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [detail, setDetail] = useState<Payout | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions?type=payout");
      const json = await res.json();
      setRows(Array.isArray(json.transactions) ? json.transactions : []);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const partitioned = useMemo(() => {
    const m: Record<Status, Payout[]> = {
      "PENDING APPROVAL": [],
      PROCESSING: [],
      COMPLETED: [],
      CANCELLED: [],
    };
    for (const r of rows) m[statusOf(r)].push(r);
    return m;
  }, [rows]);

  async function act(id: string, kind: "confirm" | "cancel") {
    try {
      const body = kind === "confirm" ? {} : { reason: "rejected by admin" };
      const res = await fetch(`/api/payouts/${id}/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(`Failed: ${j.error || res.status}`);
        return;
      }
      await load();
    } catch (e) {
      alert(`Failed: ${(e as Error).message}`);
    }
  }

  const list = partitioned[tab];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--text)" }}>{t("app.payouts.title")}</h1>
          <p style={{ color: "var(--text-muted)", margin: "6px 0 0", fontSize: 14 }}>
            Manage outgoing payments across your recipient network.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setBatchOpen(true)} style={ghostBtn}>Batch Payout</button>
          <button onClick={() => setNewOpen(true)} style={primaryBtn}>+ New Payout</button>
        </div>
      </div>

      <div style={{ ...glass, padding: 6, marginBottom: 16, display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "9px 16px",
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
              {t} ({partitioned[t].length})
            </button>
          );
        })}
      </div>

      <div style={{ ...glass, padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading payouts…</div>
        ) : err ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--danger)" }}>Failed to load: {err}</div>
        ) : list.length === 0 ? (
          <EmptyState tab={tab} onNew={() => setNewOpen(true)} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(var(--primary-rgb), 0.04)" }}>
                  <Th>ID</Th>
                  <Th>Recipient</Th>
                  <Th style={{ textAlign: "right" }}>Amount</Th>
                  <Th>Currency</Th>
                  <Th>Reference</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const st = statusOf(p);
                  return (
                    <tr key={p.id} onClick={() => setDetail(p)} style={{ cursor: "pointer", borderTop: "1px solid var(--glass-border)" }}>
                      <Td><span style={{ ...mono, fontSize: 12, color: "var(--text-secondary)" }}>{String(p.id).slice(0, 10)}…</span></Td>
                      <Td>{p.email || p.userId || p.recipientUserId || "—"}</Td>
                      <Td style={{ textAlign: "right", ...mono }}>{formatMoney(p.amount, p.currency || "USD")}</Td>
                      <Td><span style={{ ...mono, fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(var(--primary-rgb), 0.1)", color: "var(--primary)" }}>{p.currency || "USD"}</span></Td>
                      <Td>{p.reference || p.externalTransactionId || "—"}</Td>
                      <Td>{new Date(p.createdDate).toLocaleDateString()}</Td>
                      <Td>
                        {st === "PENDING APPROVAL" ? (
                          <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                            <button style={smallPrimary} onClick={() => act(p.id, "confirm")}>Approve</button>
                            <button style={smallGhost} onClick={() => act(p.id, "cancel")}>Reject</button>
                          </div>
                        ) : (
                          <span style={badge(st)}>{st}</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {newOpen && <NewPayoutModal onClose={() => setNewOpen(false)} onSuccess={load} />}
      {batchOpen && <BatchPayoutModal onClose={() => setBatchOpen(false)} onSuccess={load} />}
      {detail && <DetailModal id={detail.id} initial={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6, ...style }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text)", ...style }}>{children}</td>
  );
}

function EmptyState({ tab, onNew }: { tab: Status; onNew: () => void }) {
  return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
      <h3 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>No {tab.toLowerCase()} payouts</h3>
      <p style={{ color: "var(--text-muted)", margin: "8px 0 18px", fontSize: 13 }}>
        Payouts you create will show up here.
      </p>
      {tab === "PENDING APPROVAL" && <button onClick={onNew} style={primaryBtn}>+ New Payout</button>}
    </div>
  );
}

function NewPayoutModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    recipientUserId: "",
    amount: "",
    currency: "USD",
    reference: "",
    webhookUrl: "",
    processImmediately: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = {
        recipientUserId: form.recipientUserId,
        amount: Number(form.amount),
        currency: form.currency,
        externalTransactionId: `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        reference: form.reference || undefined,
        webhookUrl: form.webhookUrl || undefined,
        processImmediately: form.processImmediately,
      };
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      onSuccess();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} title="New Payout">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Recipient User ID">
          <input required style={inputStyle} value={form.recipientUserId} onChange={(e) => setForm({ ...form, recipientUserId: e.target.value })} placeholder="TygaBank user ID" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Field label="Amount">
            <input required type="number" step="0.01" min="0.01" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Currency">
            <select style={inputStyle} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Reference (optional)">
          <input style={inputStyle} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        </Field>
        <Field label="Webhook URL (optional)">
          <input style={inputStyle} value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://…" />
        </Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          <input type="checkbox" checked={form.processImmediately} onChange={(e) => setForm({ ...form, processImmediately: e.target.checked })} />
          Process immediately (skip approval)
        </label>
        {err && <div style={{ color: "var(--danger)", fontSize: 12 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Creating…" : "Create Payout"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BatchPayoutModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ line: number; ok: boolean; msg: string }[]>([]);

  async function run() {
    setBusy(true);
    setResults([]);
    const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
    const out: { line: number; ok: boolean; msg: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const [userId, amount, currency, reference] = lines[i].split(",").map((s) => s.trim());
      if (!userId || !amount || !currency) {
        out.push({ line: i + 1, ok: false, msg: "invalid row" });
        setResults([...out]);
        continue;
      }
      try {
        const res = await fetch("/api/payouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientUserId: userId,
            amount: Number(amount),
            currency,
            reference: reference || undefined,
            externalTransactionId: `batch_${Date.now()}_${i}`,
          }),
        });
        const j = await res.json();
        out.push({ line: i + 1, ok: res.ok, msg: res.ok ? "created" : (j.error || String(res.status)) });
      } catch (e) {
        out.push({ line: i + 1, ok: false, msg: (e as Error).message });
      }
      setResults([...out]);
    }
    setBusy(false);
    onSuccess();
  }

  return (
    <Modal onClose={onClose} title="Batch Payouts">
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 12px" }}>
        Paste one payout per line: <code>userId,amount,currency,reference</code>
      </p>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={8}
        style={{ ...inputStyle, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, resize: "vertical" }}
        placeholder="abc123,100,USD,Invoice 001&#10;def456,50.50,EUR,Invoice 002"
      />
      {results.length > 0 && (
        <div style={{ marginTop: 14, maxHeight: 200, overflowY: "auto", border: "1px solid var(--glass-border)", borderRadius: 10, padding: 8 }}>
          {results.map((r) => (
            <div key={r.line} style={{ fontSize: 12, color: r.ok ? "var(--success)" : "var(--danger)", padding: "2px 4px" }}>
              Row {r.line}: {r.ok ? "✓" : "✗"} {r.msg}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Close</button>
        <button onClick={run} disabled={busy || !csv.trim()} style={{ ...primaryBtn, flex: 1, opacity: busy || !csv.trim() ? 0.6 : 1 }}>
          {busy ? "Processing…" : "Run Batch"}
        </button>
      </div>
    </Modal>
  );
}

function DetailModal({ id, initial, onClose }: { id: string; initial: Payout; onClose: () => void }) {
  const [data, setData] = useState<Payout | null>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/payouts/${id}`);
        const j = await res.json();
        if (res.ok && j.payout) setData(j.payout as Payout);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <Modal onClose={onClose} title="Payout Details">
      {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Row k="ID" v={<span style={{ ...mono, fontSize: 12 }}>{data.id}</span>} />
          <Row k="Status" v={<span style={badge(statusOf(data))}>{statusOf(data)}</span>} />
          <Row k="Amount" v={<span style={mono}>{formatMoney(data.amount, data.currency || "USD")}</span>} />
          <Row k="Currency" v={data.currency || "—"} />
          <Row k="Reference" v={data.reference || data.externalTransactionId || "—"} />
          <Row k="Recipient" v={data.email || data.userId || data.recipientUserId || "—"} />
          <Row k="Created" v={new Date(data.createdDate).toLocaleString()} />
        </div>
      )}
    </Modal>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--glass-border)", gap: 10 }}>
      <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>{k}</span>
      <span style={{ color: "var(--text)", fontSize: 13, textAlign: "right" }}>{v}</span>
    </div>
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

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box" as const,
};

const primaryBtn: React.CSSProperties = {
  background: "var(--primary)",
  color: "var(--bg)",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const smallPrimary: React.CSSProperties = {
  background: "var(--success)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const smallGhost: React.CSSProperties = {
  background: "transparent",
  color: "var(--danger)",
  border: "1px solid var(--danger)",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};
