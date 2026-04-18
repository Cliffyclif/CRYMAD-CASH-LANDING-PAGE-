"use client";

import { useEffect, useState } from "react";

type Beneficiary = {
  id: string;
  nickname?: string;
  fullName: string;
  bankName: string;
  accountNumberMasked: string;
  swiftBic?: string;
  iban?: string;
  currency: string;
  country: string;
  createdAt: string;
};

export default function BeneficiariesPage() {
  const [list, setList] = useState<Beneficiary[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/beneficiaries");
    if (!res.ok) { setList([]); return; }
    const j = await res.json();
    setList(j.beneficiaries ?? []);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Remove this beneficiary?")) return;
    await fetch(`/api/beneficiaries/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = (list ?? []).filter((b) => {
    const q = search.toLowerCase();
    return !q || b.fullName.toLowerCase().includes(q) || b.bankName.toLowerCase().includes(q);
  });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Beneficiaries</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Saved bank accounts for quick withdrawals</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          padding: "10px 18px", borderRadius: 12, border: "none",
          background: "var(--primary)", color: "var(--bg)", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>+ Add Beneficiary</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or bank..."
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            color: "var(--text)", fontSize: 14, outline: "none",
          }} />
      </div>

      {list === null && <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>}

      {list !== null && filtered.length === 0 && (
        <div style={{
          padding: 50, textAlign: "center",
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 16,
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>📇</div>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>No beneficiaries yet</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Add a bank account to enable fast withdrawals.</p>
          <button onClick={() => setShowAdd(true)} style={{
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: "var(--primary)", color: "var(--bg)", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Add Your First Beneficiary</button>
        </div>
      )}

      {list !== null && filtered.length > 0 && (
        <div style={{
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
          borderRadius: 16, overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(var(--primary-rgb),0.04)" }}>
                {["Name", "Bank", "Account", "Currency", "Country", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} style={{ borderTop: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600 }}>{b.nickname || b.fullName}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>{b.bankName}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>{b.accountNumberMasked}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{b.currency}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{b.country}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <button onClick={() => remove(b.id)} style={{
                      background: "transparent", border: "1px solid rgba(239,68,68,0.3)",
                      color: "var(--danger)", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onDone={load} />}
    </>
  );
}

function AddModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!fullName || !bankName || !accountNumber) { setErr("Please fill in required fields."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/beneficiaries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, nickname: nickname || undefined, bankName, accountNumber, swiftBic: swiftBic || undefined, currency, country }),
      });
      if (!res.ok) { setErr("Failed to add. Try again."); return; }
      onDone(); onClose();
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    background: "var(--surface)", border: "1px solid var(--glass-border)",
    color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif",
  };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-muted)", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "var(--bg-elevated, #0b1c16)", border: "1px solid var(--glass-border)", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Beneficiary</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--glass-border)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Nickname (optional)</label><input value={nickname} onChange={(e) => setNickname(e.target.value)} style={input} placeholder="Mom, John's business, etc." /></div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Full Name *</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} style={input} required /></div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Bank Name *</label><input value={bankName} onChange={(e) => setBankName(e.target.value)} style={input} required /></div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Account Number / IBAN *</label><input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={input} required /></div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>SWIFT / BIC</label><input value={swiftBic} onChange={(e) => setSwiftBic(e.target.value)} style={input} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={input}>
                {["USD","EUR","GBP","CAD","AUD","NGN","JPY","CHF","SGD"].map((c) => <option key={c} value={c} style={{ background: "var(--bg)" }}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Country (ISO)</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={input}>
                {["US","GB","CA","DE","FR","NG","ZA","IN","BR","JP","SG","AE","NL","CH","IE","KE","GH"].map((c) => <option key={c} value={c} style={{ background: "var(--bg)" }}>{c}</option>)}
              </select>
            </div>
          </div>
          {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)" }}>{err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: loading ? "var(--text-muted)" : "var(--primary)", color: "var(--bg)", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Saving..." : "Save Beneficiary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
