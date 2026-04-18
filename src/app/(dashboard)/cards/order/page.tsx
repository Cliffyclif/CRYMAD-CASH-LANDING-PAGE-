"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, formatMoney } from "@/components/providers/UserProvider";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "var(--font-mono)",
};

const btnPrimary: React.CSSProperties = {
  background: "var(--primary)",
  color: "var(--bg)",
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "12px 24px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

type CardKind = "virtual_card" | "physical_card";

type QuoteItem = { name?: string; label?: string; amount?: number; currency?: string; [key: string]: unknown };
type QuoteShape = {
  items?: QuoteItem[];
  fees?: QuoteItem[];
  total?: number;
  currency?: string;
  [key: string]: unknown;
};

export default function OrderCardPage() {
  const { walletsByType } = useUser();
  const [cardType, setCardType] = useState<CardKind>("virtual_card");
  const [walletType, setWalletType] = useState<"ewallet" | "crypto">("ewallet");
  const [quote, setQuote] = useState<QuoteShape | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadQuote = async () => {
    setQuoteLoading(true); setErr(null); setQuote(null);
    try {
      const qs = new URLSearchParams({ walletType, cardType });
      const r = await fetch(`/api/cards/order/quote?${qs}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || String(r.status));
      if (j.unavailable) {
        setErr(j.message || "Card pricing temporarily unavailable.");
        setQuote(null);
      } else {
        setQuote(j.quote || {});
      }
    } catch (e) { setErr((e as Error).message); }
    finally { setQuoteLoading(false); }
  };

  useEffect(() => { loadQuote(); }, [cardType, walletType]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendOtp = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/cards/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "order", walletType }) });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      setOtpSent(true);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const placeOrder = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/cards/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardType, walletType, otp }) });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      setSuccess(true);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  if (success) {
    return (
      <div style={{ ...glass, padding: "60px 40px", textAlign: "center", maxWidth: 520, margin: "60px auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>Order Placed</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 28px" }}>Your card order has been submitted.</p>
        <Link href="/cards" style={{ ...btnPrimary, display: "inline-block", textDecoration: "none" }}>Back to Cards</Link>
      </div>
    );
  }

  const items: QuoteItem[] = (quote?.items || quote?.fees || []) as QuoteItem[];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ color: "var(--text)", fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Order New Card</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>Choose your card type and funding source.</p>

      {/* Card type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {(["virtual_card", "physical_card"] as const).map((t) => (
          <button key={t} onClick={() => setCardType(t)} style={{ ...glass, padding: 24, textAlign: "left", cursor: "pointer", border: cardType === t ? "2px solid var(--primary)" : "1px solid var(--glass-border)", background: cardType === t ? "rgba(var(--primary-rgb),0.08)" : "var(--glass-bg)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{t === "virtual_card" ? "Virtual Card" : "Physical Card"}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t === "virtual_card" ? "Instant issuance for online use." : "Delivered to your address."}</div>
          </button>
        ))}
      </div>

      {/* Funding source */}
      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Funding Wallet</div>
        {(["ewallet", "crypto"] as const).map((s) => {
          const w = walletsByType[s];
          return (
            <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: walletType === s ? "rgba(var(--primary-rgb),0.1)" : "var(--surface)", border: walletType === s ? "1px solid var(--primary)" : "1px solid var(--glass-border)", borderRadius: 12, cursor: "pointer", marginBottom: 8 }}>
              <input type="radio" checked={walletType === s} onChange={() => setWalletType(s)} style={{ accentColor: "var(--primary)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 600 }}>{s === "ewallet" ? "E-Wallet" : "Crypto"}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Balance: {w ? formatMoney(w.balance, w.currency) : "—"}</div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Quote */}
      <div style={{ ...glass, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ color: "var(--text)", margin: 0, fontSize: 16 }}>Order Breakdown</h3>
          {quoteLoading && <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading…</span>}
        </div>
        {items.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Item", "Amount"].map((h) => (
                  <th key={h} style={{ textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, padding: "0 12px 12px 0", borderBottom: "1px solid var(--glass-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={{ padding: "12px 12px 12px 0", color: "var(--text)", borderBottom: "1px solid var(--glass-border)" }}>{it.name || it.label || "Item"}</td>
                  <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", color: "var(--text)", fontWeight: 600, borderBottom: "1px solid var(--glass-border)" }}>{typeof it.amount === "number" ? formatMoney(it.amount, (it.currency as string) || quote?.currency || "USD") : String(it.amount ?? "—")}</td>
                </tr>
              ))}
              {typeof quote?.total === "number" && (
                <tr>
                  <td style={{ padding: "12px 0", color: "var(--text)", fontWeight: 700 }}>Total</td>
                  <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", color: "var(--primary)", fontWeight: 700 }}>{formatMoney(quote.total, (quote.currency as string) || "USD")}</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : quote ? (
          <pre style={{ background: "var(--surface)", padding: 12, borderRadius: 10, fontSize: 11, color: "var(--text-secondary)", overflow: "auto", maxHeight: 240 }}>{JSON.stringify(quote, null, 2)}</pre>
        ) : null}
      </div>

      {/* OTP */}
      <div style={{ ...glass, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>OTP Code</label>
            <input style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontSize: 20 }} maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} disabled={!otpSent} />
          </div>
          <button onClick={sendOtp} disabled={busy} style={{ ...btnGhost, whiteSpace: "nowrap" }}>{otpSent ? "Resend OTP" : "Send OTP"}</button>
        </div>
      </div>

      {err && <div style={{ ...glass, padding: 12, color: "var(--danger)", marginBottom: 16, fontSize: 13 }}>{err}</div>}

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Link href="/cards" style={{ ...btnGhost, textDecoration: "none", display: "inline-block" }}>Cancel</Link>
        <button onClick={placeOrder} disabled={!otpSent || otp.length < 6 || busy} style={{ ...btnPrimary, opacity: !otpSent || otp.length < 6 || busy ? 0.6 : 1 }}>{busy ? "Placing…" : "Place Order"}</button>
      </div>
    </div>
  );
}
