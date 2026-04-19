"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser, formatMoney } from "@/components/providers/UserProvider";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useLanguage } from "@/i18n/LanguageContext";

/* ───── styles ───── */
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
  padding: "10px 18px",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

function MastercardLogo() {
  return (
    <svg width="48" height="30" viewBox="0 0 48 30">
      <circle cx="17" cy="15" r="12" fill="#EB001B" />
      <circle cx="31" cy="15" r="12" fill="#F79E1B" />
      <path d="M24 5.8a11.95 11.95 0 0 1 4.4 9.2 11.95 11.95 0 0 1-4.4 9.2 11.95 11.95 0 0 1-4.4-9.2A11.95 11.95 0 0 1 24 5.8z" fill="#FF5F00" />
    </svg>
  );
}

type CardRecord = {
  id: string;
  cardId?: string;
  cardType?: string;
  type?: string;
  status?: string;
  lastFour?: string;
  maskedNumber?: string;
  expiry?: string;
  expiryDate?: string;
  balance?: number;
  currency?: string;
  [key: string]: unknown;
};

function CardVisual({ card, fullName }: { card: CardRecord; fullName: string }) {
  const type = (card.cardType || card.type || "").toString();
  const isPhysical = /physical/i.test(type);
  const mask = card.maskedNumber || `•••• •••• •••• ${card.lastFour || "••••"}`;
  const expiry = card.expiry || card.expiryDate || "••/••";
  const balance = typeof card.balance === "number" ? card.balance : 0;
  const status = (card.status || "active").toString();
  const locked = /lock/i.test(status);
  const inactive = /inactive|pending/i.test(status);
  const gradient = isPhysical
    ? "linear-gradient(135deg, #1a2332, #0d1a2d)"
    : "linear-gradient(135deg, #1a1030, #0d0a20)";

  return (
    <div style={{ background: gradient, borderRadius: 18, width: 340, height: 210, padding: "24px 28px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{isPhysical ? "Physical" : "Virtual"} Card</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>{formatMoney(balance, card.currency || "USD")}</div>
        </div>
        <MastercardLogo />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: 3, color: "rgba(255,255,255,0.85)" }}>{mask}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, marginBottom: 2 }}>Cardholder</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{fullName || "—"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, marginBottom: 2 }}>Expires</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{expiry}</div>
        </div>
        <div style={{ background: locked ? "var(--danger)" : inactive ? "var(--warning)" : "var(--success)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {locked ? "Locked" : inactive ? "Pending" : "Active"}
        </div>
      </div>
    </div>
  );
}

/* ───── OTP Input ───── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          style={{ ...inputStyle, width: 44, height: 48, textAlign: "center", fontSize: 20, fontWeight: 700, padding: 0, fontFamily: "var(--font-mono)" }}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "");
            if (!d) return;
            const arr = value.padEnd(6, " ").split("");
            arr[i] = d[0];
            onChange(arr.join("").replace(/\s/g, ""));
            if (i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) refs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ ...glass, padding: 32, maxWidth: 480, width: "90%", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───── Load Card Modal ───── */
function CardShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} className="fancy-modal-backdrop" style={{
      position: "fixed", inset: 0, zIndex: 1000,
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "fadeIn 0.25s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fancy-modal-surface" style={{
        width: "100%", maxWidth: 460,
        border: "1px solid rgba(var(--primary-rgb), 0.3)",
        borderRadius: 24, padding: "26px 28px 20px",
        boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.15)",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: 0.3, textShadow: "0 0 24px rgba(var(--primary-rgb), 0.4)" }}>{title}</div>
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>{subtitle}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoadCardModal({ cardId, onClose, onDone, allCards }: {
  cardId: string; onClose: () => void; onDone: () => void;
  allCards?: Array<{ id: string; type?: string; last4?: string; number?: string }>;
}) {
  const { walletsByType } = useUser();
  const [source, setSource] = useState<"ewallet" | "crypto">("ewallet");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeCardId, setActiveCardId] = useState(cardId);

  const ewallet = walletsByType.ewallet;
  const crypto = walletsByType.crypto;
  const sourceWallet = source === "ewallet" ? ewallet : crypto;
  const amountNum = Number(amount) || 0;
  const fee = 0;
  const total = amountNum + fee;
  const otpStr = otp.join("");

  const cards = allCards ?? [];
  const active = cards.find((c) => c.id === activeCardId);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/cards/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "load", walletType: source }) });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      setOtpSent(true);
      setResendIn(60);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const submit = async () => {
    if (otpStr.length < 6) { setErr("Enter 6-digit code."); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/cards/${encodeURIComponent(activeCardId)}/load`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, walletType: source, otp: otpStr }),
      });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      setSuccess(true);
      onDone();
      setTimeout(onClose, 1200);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = d; setOtp(next);
    if (d && i < 5) document.getElementById(`load-otp-${i + 1}`)?.focus();
  };

  const QUICK = [50, 100, 500, 1000];
  const canContinue = amountNum > 0;
  const canSubmit = otpStr.length === 6;

  if (success) {
    return (
      <CardShell title="Card Loaded" subtitle="Funds available now" onClose={onClose}>
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(16,185,129,0.12)", border: "2px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600 }}>${amountNum.toFixed(2)} added to your card.</div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell title="Load Card" subtitle="Digital instance sync" onClose={onClose}>
      {/* Card tabs */}
      {cards.length > 1 && (
        <div style={{ display: "flex", gap: 18, marginBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {cards.map((c) => {
            const label = /virtual/i.test(String(c.type)) ? "Virtual" : "Physical";
            const last4 = String(c.last4 || c.number || c.id).slice(-4);
            const isActive = c.id === activeCardId;
            return (
              <button key={c.id} type="button" onClick={() => setActiveCardId(c.id)}
                style={{
                  background: "transparent", border: "none", padding: "8px 0",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                  fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                {label.toUpperCase()} •••{last4}
              </button>
            );
          })}
        </div>
      )}

      {/* Amount + quick amounts */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 44, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--primary)" }}>$</span>
          <input
            type="number" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "var(--primary)", fontSize: 44, fontWeight: 800, fontFamily: "var(--font-mono)",
              width: amount.length ? `${Math.max(3, amount.length) * 28}px` : "140px",
              padding: 0,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
          {QUICK.map((q) => {
            const active = amountNum === q;
            return (
              <button key={q} type="button" onClick={() => setAmount(String(q))}
                style={{
                  padding: "5px 14px", borderRadius: 20,
                  background: active ? "rgba(var(--primary-rgb), 0.18)" : "var(--surface)",
                  border: `1px solid ${active ? "var(--primary)" : "var(--glass-border)"}`,
                  color: active ? "var(--primary)" : "var(--text-muted)",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-mono)",
                }}>+${q}</button>
            );
          })}
        </div>
      </div>

      {/* Funding source */}
      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8, display: "block" }}>Funding Source</label>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 14,
          background: "var(--surface)", border: "1px solid var(--glass-border)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(var(--primary-rgb), 0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" />
            </svg>
          </div>
          <select value={source} onChange={(e) => setSource(e.target.value as "ewallet" | "crypto")}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              appearance: "none",
            }}>
            <option value="ewallet" style={{ background: "var(--bg)" }}>E-Wallet — {ewallet ? formatMoney(ewallet.balance, ewallet.currency) : "—"}</option>
            <option value="crypto" style={{ background: "var(--bg)" }}>Crypto — {crypto ? formatMoney(crypto.balance, crypto.currency) : "—"}</option>
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{
        padding: "12px 18px", borderRadius: 14,
        background: "var(--surface)", border: "1px solid var(--glass-border)",
        marginBottom: 18, fontSize: 12,
      }}>
        {[
          { label: "Amount", value: `$${amountNum.toFixed(2)}` },
          { label: "Fee", value: `$${fee.toFixed(2)}` },
          { label: "Total", value: `$${total.toFixed(2)}`, primary: true },
        ].map((row, i) => (
          <div key={row.label} style={{
            display: "flex", justifyContent: "space-between", padding: "6px 0",
            borderTop: i === 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            marginTop: i === 2 ? 4 : 0, paddingTop: i === 2 ? 10 : 6,
          }}>
            <span style={{
              color: row.primary ? "var(--text)" : "var(--text-muted)",
              fontWeight: row.primary ? 700 : 500,
              letterSpacing: 1, textTransform: "uppercase", fontSize: 11,
            }}>{row.label}</span>
            <span style={{ color: row.primary ? "var(--primary)" : "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* OTP */}
      {otpSent && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Enter OTP sent to your email
            </div>
            <div style={{
              padding: "3px 10px", borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              color: resendIn > 0 ? "var(--text-muted)" : "var(--primary)",
              fontFamily: "var(--font-mono)",
            }}>
              {resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, "0")}` : "Tap Resend"}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18 }}>
            {otp.map((d, i) => (
              <input key={i} id={`load-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                value={d} onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) document.getElementById(`load-otp-${i - 1}`)?.focus(); }}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--surface)",
                  border: `1.5px solid ${d ? "var(--primary)" : "var(--glass-border)"}`,
                  color: d ? "var(--primary)" : "var(--text)",
                  textAlign: "center", fontSize: 18, fontWeight: 700,
                  fontFamily: "var(--font-mono)", outline: "none",
                }} />
            ))}
          </div>
        </>
      )}

      {err && (
        <div style={{
          color: "#ef4444", fontSize: 12, textAlign: "center",
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
          marginBottom: 12,
        }}>{err}</div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onClose} type="button" style={{
          flex: 1, padding: 14, borderRadius: 28,
          background: "transparent", border: "1px solid var(--glass-border)",
          color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
          textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
        }}>Cancel</button>
        <button
          type="button"
          disabled={(otpSent ? !canSubmit : !canContinue) || busy}
          onClick={otpSent ? submit : sendOtp}
          style={{
            flex: 1.5, padding: 14, borderRadius: 28,
            background: ((otpSent ? canSubmit : canContinue) && !busy) ? "var(--primary)" : "var(--surface)",
            color: ((otpSent ? canSubmit : canContinue) && !busy) ? "var(--bg)" : "var(--text-muted)",
            fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
            border: "none", cursor: ((otpSent ? canSubmit : canContinue) && !busy) ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: ((otpSent ? canSubmit : canContinue) && !busy) ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
          }}>
          {busy ? "Processing…" : otpSent ? "Confirm Load" : "Continue"}
          {!busy && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>
    </CardShell>
  );
}

/* ───── Lock/Unlock Modal ───── */
function LockModal({ cardId, action, card, onClose, onDone }: {
  cardId: string; action: "lock" | "unlock";
  card?: { type?: string; last4?: string; number?: string };
  onClose: () => void; onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/cards/${encodeURIComponent(cardId)}/${action}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: action === "lock" ? "User requested freeze" : "User requested unlock" }),
      });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      onDone();
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const isLock = action === "lock";
  const cardLabel = /virtual/i.test(String(card?.type)) ? "Virtual" : "Physical";
  const last4 = String(card?.last4 || card?.number || cardId).slice(-4);

  return (
    <div onClick={onClose} className="fancy-modal-backdrop" style={{
      position: "fixed", inset: 0, zIndex: 1000,
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "fadeIn 0.25s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fancy-modal-surface" style={{
        width: "100%", maxWidth: 420,
        border: "1px solid rgba(var(--primary-rgb), 0.3)",
        borderRadius: 24, padding: "26px 32px 22px",
        boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -10 }}>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
        </div>

        {/* Icon */}
        <div style={{
          width: 100, height: 100, margin: "0 auto 18px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,179,8,0.15), rgba(234,179,8,0.02))",
          border: "1px solid rgba(234,179,8,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(234,179,8,0.25)",
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isLock ? (
              <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>
            ) : (
              <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0" /></>
            )}
          </svg>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: 0.3, textShadow: "0 0 24px rgba(var(--primary-rgb), 0.4)" }}>
            {isLock ? "Lock Your Card?" : "Unlock Your Card?"}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: "#eab308", textTransform: "uppercase" }}>
            {isLock ? "Temporary Card Freeze" : "Resume Card Transactions"}
          </div>
        </div>

        <p style={{
          textAlign: "center", fontSize: 13, color: "var(--text-secondary)",
          margin: "0 0 18px", lineHeight: 1.6,
        }}>
          {isLock
            ? "Locking your card will prevent all transactions until you unlock it. Existing subscriptions and auto-pay will also be paused."
            : "Unlocking will immediately resume transaction processing on this card including any paused subscriptions."}
        </p>

        {/* Card reference row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 14,
          background: "var(--surface)", border: "1px solid var(--glass-border)",
          marginBottom: 14,
        }}>
          <div style={{
            width: 36, height: 20, borderRadius: 12,
            background: "var(--primary)",
            position: "relative", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%",
              background: "var(--bg)",
            }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: "var(--text-muted)", textTransform: "uppercase" }}>{cardLabel}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)" }}>•••• {last4}</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            color: "var(--text-muted)", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            You can {isLock ? "unlock" : "lock"} anytime
          </span>
        </div>

        {err && (
          <div style={{
            color: "#ef4444", fontSize: 12, textAlign: "center",
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
            marginBottom: 12,
          }}>{err}</div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} type="button" style={{
            flex: 1, padding: 14, borderRadius: 28,
            background: "transparent", border: "1px solid var(--glass-border)",
            color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={submit} type="button" disabled={busy}
            style={{
              flex: 1.5, padding: 14, borderRadius: 28,
              background: "transparent",
              border: `1px solid ${isLock ? "#eab308" : "var(--primary)"}`,
              color: isLock ? "#eab308" : "var(--primary)",
              fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 0 20px ${isLock ? "rgba(234,179,8,0.15)" : "rgba(var(--primary-rgb), 0.15)"}`,
              opacity: busy ? 0.6 : 1,
            }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isLock
                ? <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>
                : <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0" /></>}
            </svg>
            {busy ? "Processing…" : isLock ? "Lock Card" : "Unlock Card"}
            {!busy && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Activate Card Modal ───── */
function ActivateModal({ cardId, onClose, onDone }: { cardId: string; onClose: () => void; onDone: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const digits = cardNumber.replace(/\s/g, "");
      const r = await fetch(`/api/cards/${encodeURIComponent(cardId)}/activate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardNumber: digits }) });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      setSuccess(true);
      onDone();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  if (success) {
    return (
      <Modal title="Card Activated" onClose={onClose}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ color: "var(--success)", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your card is now active.</div>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Activate Card" onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 6 }}>Enter 16-digit card number</div>
        <input
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
          maxLength={19}
          placeholder="0000 0000 0000 0000"
          style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: 2, textAlign: "center" }}
        />
      </div>
      {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onClose} style={{ ...btnGhost, flex: 1 }}>Cancel</button>
        <button onClick={submit} disabled={cardNumber.replace(/\s/g, "").length < 16 || busy} style={{ ...btnPrimary, flex: 1, opacity: cardNumber.replace(/\s/g, "").length < 16 || busy ? 0.6 : 1 }}>{busy ? "Activating…" : "Activate"}</button>
      </div>
    </Modal>
  );
}

/* ───── Credentials Modal ───── */
function CredentialsModal({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [creds, setCreds] = useState<{ cardNumber?: string; cvv?: string; expiry?: string; [key: string]: unknown } | null>(null);
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendOtp = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/cards/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "credentials" }) });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  useEffect(() => { sendOtp(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const verify = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/cards/${encodeURIComponent(cardId)}/credentials`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ otp }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || String(r.status));
      setCreds(j.credentials || {});
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown((p) => {
          if (p <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            onClose();
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const reveal = () => {
    setCreds(null);
    setOtp("");
    if (timerRef.current) clearInterval(timerRef.current);
    sendOtp();
  };

  if (creds) {
    return (
      <CardShell title="Card Details" subtitle={`Sensitive information — auto-hides in ${countdown}s`} onClose={onClose}>
        {/* Card */}
        <div style={{
          position: "relative", padding: 24, borderRadius: 18,
          background: "linear-gradient(135deg, #0a1612 0%, #06100c 100%)",
          border: "1px solid rgba(var(--primary-rgb), 0.2)",
          minHeight: 200, marginBottom: 18, overflow: "hidden",
        }}>
          {/* Chip + brand */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
            <div style={{
              width: 38, height: 30, borderRadius: 6,
              background: "linear-gradient(135deg, #d4a24c, #a27e2c)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 4,
                background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px),
                             repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)`,
              }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.7)" }}>CRYMAD PREMIUM</div>
              <MastercardLogo />
            </div>
          </div>

          {/* Number */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{
              color: "#ffffff", fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, letterSpacing: 3,
            }}>{creds.cardNumber || "—"}</div>
            <button onClick={() => creds.cardNumber && navigator.clipboard.writeText(String(creds.cardNumber))}
              style={{ background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", padding: 4, display: "flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>

          {/* Holder, expires, cvv */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 0.8fr", gap: 16 }}>
            {[
              { label: "Card Holder", value: String(creds.cardHolder || creds.holderName || "—") },
              { label: "Expires", value: String(creds.expiry || "—") },
              { label: "CVV", value: String(creds.cvv || "—") },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 4 }}>
                  {f.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#ffffff", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>{f.value}</span>
                  <button onClick={() => navigator.clipboard.writeText(f.value)}
                    style={{ background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", padding: 2, display: "flex" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown + PCI */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            color: "#eab308", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#eab308", boxShadow: "0 0 6px #eab308" }} />
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Hiding in 0:{String(countdown).padStart(2, "0")}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: 1, color: "var(--text-muted)", textTransform: "uppercase" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            PCI-DSS Compliant
          </div>
        </div>

        {/* Warning */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 14px", borderRadius: 12,
          background: "rgba(234, 179, 8, 0.06)", border: "1px solid rgba(234, 179, 8, 0.25)",
          marginBottom: 18,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Never share these details with anyone. Crymad support will never ask for them.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} type="button" style={{
            flex: 1, padding: 14, borderRadius: 28,
            background: "transparent", border: "1px solid var(--glass-border)",
            color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}>Close</button>
          <button onClick={reveal} type="button" style={{
            flex: 1, padding: 14, borderRadius: 28,
            background: "transparent", border: "1px solid var(--glass-border)",
            color: "var(--text-muted)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}>Reveal Again</button>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell title="Card Details" subtitle="Sensitive information — verify to reveal" onClose={onClose}>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "0 0 18px", textAlign: "center" }}>
        Enter the OTP sent to your email to securely reveal your card number, expiry, and CVV.
      </p>
      <div style={{ marginBottom: 18 }}><OtpInput value={otp} onChange={setOtp} /></div>
      {err && (
        <div style={{
          color: "#ef4444", fontSize: 12, textAlign: "center",
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
          marginBottom: 12,
        }}>{err}</div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: 14, borderRadius: 28,
          background: "transparent", border: "1px solid var(--glass-border)",
          color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
          textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
        }}>Cancel</button>
        <button onClick={verify} disabled={otp.length < 6 || busy} style={{
          flex: 1.5, padding: 14, borderRadius: 28,
          background: otp.length === 6 && !busy ? "var(--primary)" : "var(--surface)",
          color: otp.length === 6 && !busy ? "var(--bg)" : "var(--text-muted)",
          fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
          border: "none", cursor: otp.length === 6 && !busy ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          boxShadow: otp.length === 6 && !busy ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
        }}>{busy ? "Verifying…" : "Reveal Details"}</button>
      </div>
    </CardShell>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
type AccountResp = {
  id?: string;
  cards?: CardRecord[];
  kycStatus?: string;
  [key: string]: unknown;
} | null;

export default function CardsPage() {
  const { t } = useLanguage();
  const { user, fullName } = useUser();
  const [account, setAccount] = useState<AccountResp>(null);
  const [kyc, setKyc] = useState<{ status?: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [loadCardId, setLoadCardId] = useState<string | null>(null);
  const [lockCard, setLockCard] = useState<{ id: string; action: "lock" | "unlock" } | null>(null);
  const [activateCardId, setActivateCardId] = useState<string | null>(null);
  const [credsCardId, setCredsCardId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const [ar, kr] = await Promise.all([
        fetch("/api/cards/account"),
        fetch("/api/cards/kyc-status"),
      ]);
      const aj = await ar.json();
      const kj = await kr.json();
      if (!ar.ok && ar.status !== 404) throw new Error(aj.error || String(ar.status));
      setAccount(aj.account ?? null);
      setKyc(kj.kyc ?? null);
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div style={{ ...glass, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  }

  /* No account yet */
  if (!account) {
    return (
      <div style={{ ...glass, padding: "60px 40px", textAlign: "center", maxWidth: 520, margin: "60px auto" }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: 24 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>Set up your card account</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 28px" }}>Complete your identity verification to get started with Crymad cards.</p>
        {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{err}</div>}
        <Link href="/cards/setup" style={{ ...btnPrimary, display: "inline-block", textDecoration: "none", padding: "14px 40px", fontSize: 15 }}>Get Started</Link>
      </div>
    );
  }

  const kycStatus = (kyc?.status || account.kycStatus || "").toString().toLowerCase();
  const isPending = /pending|review|processing/.test(kycStatus) && !/approved/.test(kycStatus);
  const isApproved = /approved|verified|complete/.test(kycStatus);

  const cards = Array.isArray(account.cards) ? account.cards : [];

  return (
    <>
      {/* Heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "var(--text)", fontSize: 26, fontWeight: 800, margin: 0 }}>My Cards</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>Manage your physical and virtual cards</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/cards/fees" style={{ ...btnGhost, textDecoration: "none" }}>Fee Schedule</Link>
          <Link href="/cards/order" style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}>{t("app.cards.orderFirstCard")}</Link>
        </div>
      </div>

      {isPending && (
        <div style={{ ...glass, padding: 16, marginBottom: 20, background: "rgba(245,158,11,0.08)", border: "1px solid var(--warning)", color: "var(--text)" }}>
          <strong style={{ color: "var(--warning)" }}>Verification in progress.</strong> Your identity verification is being reviewed. This usually takes 1–2 business days.
        </div>
      )}

      {err && <div style={{ ...glass, padding: 12, color: "var(--danger)", marginBottom: 16, fontSize: 13 }}>{err}</div>}

      {/* Cards */}
      {isApproved && cards.length > 0 ? (
        <div style={{ display: "flex", gap: 28, marginBottom: 28, flexWrap: "wrap" }}>
          {cards.map((card) => {
            const id = card.id || card.cardId || "";
            const status = (card.status || "").toString();
            const locked = /lock/i.test(status);
            const inactive = /inactive|pending/i.test(status);
            return (
              <div key={id}>
                <CardVisual card={card} fullName={fullName || (user?.email ?? "")} />
                <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => setLoadCardId(id)} style={{ ...btnGhost, fontSize: 12, padding: "8px 14px" }}>Load Funds</button>
                  <button onClick={() => setLockCard({ id, action: locked ? "unlock" : "lock" })} style={{ ...btnGhost, fontSize: 12, padding: "8px 14px" }}>{locked ? "Unlock" : "Lock"}</button>
                  {inactive && <button onClick={() => setActivateCardId(id)} style={{ ...btnGhost, fontSize: 12, padding: "8px 14px" }}>Activate</button>}
                  <button onClick={() => setCredsCardId(id)} style={{ ...btnGhost, fontSize: 12, padding: "8px 14px" }}>View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : isApproved ? (
        <div style={{ ...glass, padding: 40, textAlign: "center", marginBottom: 28 }}>
          <h3 style={{ color: "var(--text)", margin: "0 0 12px" }}>{t("app.cards.noCardsYet")}</h3>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 20px", fontSize: 14 }}>{t("app.cards.noCardsBody")}</p>
          <Link href="/cards/order" style={{ ...btnPrimary, display: "inline-block", textDecoration: "none" }}>{t("app.cards.orderFirstCard")}</Link>
        </div>
      ) : null}

      {/* Card Transactions */}
      <div style={{ ...glass, padding: 24, marginBottom: 24 }}>
        <ActivityFeed walletType="card" limit={8} />
      </div>

      {/* Modals */}
      {loadCardId && <LoadCardModal cardId={loadCardId} onClose={() => setLoadCardId(null)} onDone={load} allCards={cards.map((c) => ({ id: c.id || c.cardId || "", type: String(c.type || ""), last4: String(c.last4 || c.number || "").slice(-4) }))} />}
      {lockCard && <LockModal cardId={lockCard.id} action={lockCard.action} onClose={() => setLockCard(null)} onDone={load} card={cards.find((c) => (c.id || c.cardId) === lockCard.id) as { type?: string; last4?: string; number?: string } | undefined} />}
      {activateCardId && <ActivateModal cardId={activateCardId} onClose={() => setActivateCardId(null)} onDone={load} />}
      {credsCardId && <CredentialsModal cardId={credsCardId} onClose={() => setCredsCardId(null)} />}
    </>
  );
}
