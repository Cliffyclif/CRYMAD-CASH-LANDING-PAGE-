"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useUser, formatMoney } from "@/components/providers/UserProvider";
import { tokenIcon } from "@/lib/tokens/icons";
import { QRScannerModal } from "@/components/modals/QRScannerModal";
import { AssetCard } from "@/components/dashboard/AssetCard";

type MarketPrice = { symbol: string; name: string; price: number; change24h: number; sparkline: number[] };

/* ─── Shared Styles ─── */
const glassCard: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
  padding: 24,
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

const primaryBtn: React.CSSProperties = {
  background: "var(--primary)",
  color: "var(--bg)",
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  color: "var(--text)",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 200,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalContent: React.CSSProperties = {
  ...glassCard,
  maxWidth: 520,
  width: "90%",
  maxHeight: "85vh",
  overflowY: "auto",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
  display: "block",
};

const actionPill: React.CSSProperties = {
  ...glassCard,
  padding: "12px 20px",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text)",
};

// Supported lists live inside ActivateAssetsModal (NETWORK_META / CUSTODIAL_META).

type CustodialWallet = {
  id?: string;
  token?: string;
  currency?: string;
  symbol?: string;
  balance?: number;
  address?: string;
  [key: string]: unknown;
};

type DepositAddress = {
  address: string;
  network: string;
  supportedTokens?: string[];
};

/* ─── Generic modal wrapper ─── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: "var(--text)", margin: "0 0 20px", fontSize: 18 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ─── Fancy modal shell (emerald-glow, for Deposit / Withdraw) ─── */
function FancyModal({
  title, subtitle, onClose, children, maxWidth = 480,
}: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  return (
    <div
      onClick={onClose}
      className="fancy-modal-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fancy-modal-surface"
        style={{
          width: "100%", maxWidth,
          border: "1px solid rgba(var(--primary-rgb), 0.3)",
          borderRadius: 24, padding: "26px 28px 22px",
          boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.15), inset 0 0 40px rgba(var(--primary-rgb), 0.03)",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ flex: 1, textAlign: "center", paddingRight: 24 }}>
            <div style={{
              fontSize: 20, fontWeight: 800, color: "var(--primary)",
              textTransform: "uppercase", letterSpacing: 2,
              textShadow: "0 0 24px rgba(var(--primary-rgb), 0.4)",
            }}>{title}</div>
            {subtitle && (
              <div style={{
                marginTop: 4, fontSize: 10, fontWeight: 600, letterSpacing: 2,
                color: "var(--text-muted)", textTransform: "uppercase",
              }}>{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent", border: "none", color: "var(--text-muted)",
              fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1,
            }}
          >×</button>
        </div>
        <div style={{ marginTop: 20 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Small UI helpers for fancy modals ─── */
const smallLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
  color: "var(--text-muted)", marginBottom: 8, display: "block",
};

const SUPPORTED_ASSETS_FULL = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network" },
  { symbol: "ETH", name: "Ethereum", network: "ERC-20" },
  { symbol: "SOL", name: "Solana", network: "Solana" },
  { symbol: "BNB", name: "Binance Coin", network: "BEP-20" },
  { symbol: "XRP", name: "Ripple", network: "XRP Ledger" },
  { symbol: "USDT", name: "Tether", network: "ERC-20" },
  { symbol: "USDC", name: "USD Coin", network: "ERC-20" },
  { symbol: "MATIC", name: "Polygon", network: "Polygon" },
];

function AssetPicker({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const active = SUPPORTED_ASSETS_FULL.find((a) => a.symbol === value) || SUPPORTED_ASSETS_FULL[0];
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 14,
          background: "var(--surface)", border: "1px solid var(--glass-border)",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <img src={tokenIcon(active.symbol)} alt={active.symbol} width={32} height={32} style={{ borderRadius: "50%" }} />
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 700 }}>{active.name}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: 1, marginTop: 2, textTransform: "uppercase" }}>
            {active.symbol} · {active.network}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10,
          background: "var(--bg)", border: "1px solid var(--glass-border)", borderRadius: 14,
          overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          maxHeight: 280, overflowY: "auto",
        }}>
          {SUPPORTED_ASSETS_FULL.map((a) => (
            <button
              key={a.symbol}
              type="button"
              onClick={() => { onChange(a.symbol); setOpen(false); }}
              style={{
                width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
                background: a.symbol === value ? "rgba(var(--primary-rgb), 0.08)" : "transparent",
                border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
              }}
            >
              <img src={tokenIcon(a.symbol)} alt={a.symbol} width={24} height={24} style={{ borderRadius: "50%" }} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>{a.symbol} · {a.network}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Modals ─── */

/* Activate all supported networks + custodial tokens in one panel.
   Shows each asset as a row: icon + name/subtitle + "Active" pill (if already
   claimed/created) or an "Activate" button that POSTs to the right endpoint. */
const NETWORK_META: Record<string, { name: string; sub: string; tokens: string[] }> = {
  ETH:   { name: "Ethereum",  sub: "ERC-20 network",   tokens: ["USDT", "USDC"] },
  TRON:  { name: "Tron",      sub: "TRC-20 network",   tokens: ["USDT", "USDC"] },
  BSC:   { name: "BNB Chain", sub: "BEP-20 network",   tokens: ["USDT", "USDC"] },
  MATIC: { name: "Polygon",   sub: "Polygon network",  tokens: ["USDT", "USDC"] },
};

const CUSTODIAL_META: Record<string, { name: string; sub: string }> = {
  BTC: { name: "Bitcoin",       sub: "Native BTC wallet" },
  SOL: { name: "Solana",        sub: "Native SOL wallet" },
  XRP: { name: "Ripple",        sub: "Native XRP wallet" },
  BNB: { name: "Binance Coin",  sub: "Native BNB wallet" },
  LTT: { name: "LTT Token",     sub: "Native LTT wallet" },
};

function ActivateAssetsModal({
  addresses, wallets, onClose, onActivated,
}: {
  addresses: DepositAddress[];
  wallets: CustodialWallet[];
  onClose: () => void;
  onActivated: () => void;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const claimedNetworks = new Set(
    addresses.map((a) => String(a.network || "").toUpperCase()),
  );
  const createdTokens = new Set(
    wallets.map((w) => String(w.token || w.symbol || w.currency || "").toUpperCase()),
  );

  const activateNetwork = async (network: string) => {
    setBusyKey(`net:${network}`); setErr(null);
    try {
      const r = await fetch("/api/crypto/claim-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || j.error || `Failed (${r.status})`);
      onActivated();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  };

  const activateCustodial = async (token: string) => {
    setBusyKey(`tok:${token}`); setErr(null);
    try {
      const r = await fetch("/api/crypto/create-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || j.error || `Failed (${r.status})`);
      onActivated();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  };

  const row = (opts: {
    symbol: string;
    name: string;
    sub: string;
    active: boolean;
    busy: boolean;
    onActivate: () => void;
  }) => (
    <div
      key={opts.symbol}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px",
        borderRadius: 14,
        background: "var(--surface)",
        border: `1px solid ${opts.active ? "rgba(var(--primary-rgb), 0.35)" : "var(--glass-border)"}`,
      }}
    >
      <img src={tokenIcon(opts.symbol)} alt={opts.symbol} width={36} height={36} style={{ borderRadius: "50%" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 700 }}>
          {opts.name} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>· {opts.symbol}</span>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{opts.sub}</div>
      </div>
      {opts.active ? (
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 999,
            background: "rgba(var(--primary-rgb), 0.12)",
            border: "1px solid rgba(var(--primary-rgb), 0.35)",
            color: "var(--primary)",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Active
        </span>
      ) : (
        <button
          type="button"
          disabled={opts.busy}
          onClick={opts.onActivate}
          style={{
            padding: "8px 16px", borderRadius: 999,
            border: "1px solid var(--primary)",
            background: "transparent",
            color: "var(--primary)",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
            cursor: opts.busy ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {opts.busy ? "Activating…" : "Activate"}
        </button>
      )}
    </div>
  );

  return (
    <FancyModal title="Activate Assets" subtitle="Deposit Networks + Custodial Wallets" onClose={onClose} maxWidth={540}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Deposit Networks */}
        <div>
          <div style={{ ...smallLabel, marginBottom: 10 }}>
            ◆ Deposit Networks (USDT / USDC)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(NETWORK_META).map(([net, meta]) =>
              row({
                symbol: net === "MATIC" ? "MATIC" : net,
                name: meta.name,
                sub: `${meta.sub} · Accepts ${meta.tokens.join(" / ")}`,
                active: claimedNetworks.has(net),
                busy: busyKey === `net:${net}`,
                onActivate: () => activateNetwork(net),
              })
            )}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            Each active network gives you a deposit address for receiving USDT and USDC on that chain.
          </p>
        </div>

        {/* Custodial Wallets */}
        <div>
          <div style={{ ...smallLabel, marginBottom: 10 }}>
            ◆ Native Crypto Wallets
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(CUSTODIAL_META).map(([tok, meta]) =>
              row({
                symbol: tok,
                name: meta.name,
                sub: meta.sub,
                active: createdTokens.has(tok),
                busy: busyKey === `tok:${tok}`,
                onActivate: () => activateCustodial(tok),
              })
            )}
          </div>
        </div>

        {err && (
          <div
            style={{
              color: "var(--danger)", fontSize: 12,
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {err}
          </div>
        )}
      </div>
    </FancyModal>
  );
}

/* Load a card from crypto wallet — fetches user's cards, picks one, sends OTP,
   then POSTs /api/cards/:cardId/load with walletType=crypto. */
function CryptoToCardModal({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<Array<{ id: string; last4?: string; type?: string }>>([]);
  const [cardId, setCardId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/cards/account")
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        const list = (j?.data?.cards ?? j?.cards ?? []) as Array<Record<string, unknown>>;
        const normalized = list.map((c) => ({
          id: String(c.id ?? ""),
          last4: String(c.cardNumber ?? "").slice(-4),
          type: String(c.type ?? ""),
        })).filter((c) => c.id);
        setCards(normalized);
        if (normalized[0]) setCardId(normalized[0].id);
      })
      .catch(() => setCards([]));
  }, []);

  const sendOtp = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/cards/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "load_card", walletType: "crypto" }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `OTP failed (${r.status})`);
      }
      setOtpSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const amt = Number(amount);
    if (!cardId) { setErr("Select a card"); return; }
    if (!amt || amt <= 0) { setErr("Enter a valid amount"); return; }
    if (!otp || otp.length < 4) { setErr("Enter the OTP sent to your email"); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/cards/${cardId}/load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, walletType: "crypto", otp }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.details?.message || j.error || `Load failed (${r.status})`);
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <FancyModal title="Card Loaded" onClose={onClose} maxWidth={420}>
        <div style={{ textAlign: "center", padding: "14px 0 8px" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>
            ${amount} will arrive on your card shortly.
          </p>
          <button style={primaryBtn} onClick={onClose}>Done</button>
        </div>
      </FancyModal>
    );
  }

  return (
    <FancyModal title="Withdraw to Card" subtitle="Crypto → Card" onClose={onClose} maxWidth={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={smallLabel}>Card</label>
          {cards.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "10px 0" }}>
              No card yet. <a href="/cards/order" style={{ color: "var(--primary)" }}>Order one →</a>
            </div>
          ) : (
            <select
              style={inputStyle}
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c.type || "card").replace("_", " ")} •••• {c.last4 || "…"}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label style={smallLabel}>Amount (USD)</label>
          <input
            type="number"
            style={inputStyle}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            inputMode="decimal"
          />
        </div>

        {!otpSent ? (
          <button style={primaryBtn} disabled={busy || !cardId || !amount} onClick={sendOtp}>
            {busy ? "Sending…" : "Send OTP"}
          </button>
        ) : (
          <>
            <div>
              <label style={smallLabel}>Enter 6-Digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 18 }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
              />
            </div>
            <button style={primaryBtn} disabled={busy || !otp} onClick={submit}>
              {busy ? "Loading…" : "Confirm Withdrawal"}
            </button>
          </>
        )}

        {err && <div style={{ color: "var(--danger)", fontSize: 12 }}>{err}</div>}
      </div>
    </FancyModal>
  );
}

function DepositModal({ addresses, onClose }: { addresses: DepositAddress[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // If no claimed addresses yet, synthesize a default view using the first supported asset for UI preview
  const addr = addresses[idx];
  const active = SUPPORTED_ASSETS_FULL.find((a) => a.symbol.toUpperCase() === String(addr?.network).toUpperCase())
    ?? SUPPORTED_ASSETS_FULL[0];

  useEffect(() => {
    const v = addr?.address;
    if (!v) { setQr(""); return; }
    QRCode.toDataURL(v, {
      width: 320, margin: 1,
      color: { dark: "#0a1612", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then(setQr).catch(() => setQr(""));
  }, [addr?.address]);

  const handleCopy = () => {
    if (!addr?.address) return;
    navigator.clipboard.writeText(addr.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shortAddr = addr?.address
    ? `${addr.address.slice(0, 10)}…${addr.address.slice(-4)}`
    : "";

  // Corner bracket overlay (scanner frame)
  const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => (
    <div style={{
      position: "absolute", width: 20, height: 20,
      borderColor: "var(--primary)", borderStyle: "solid", borderWidth: 0,
      ...(pos === "tl" ? { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 } : {}),
      ...(pos === "tr" ? { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 } : {}),
      ...(pos === "bl" ? { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 } : {}),
      ...(pos === "br" ? { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 } : {}),
    }} />
  );

  return (
    <FancyModal title="Deposit Crypto" subtitle="Receive crypto to wallet" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {addresses.length === 0 ? (
          <div style={{
            padding: "30px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: 13,
          }}>
            No deposit addresses yet. Claim one from the Receive Assets panel first.
          </div>
        ) : (
          <>
            {/* Asset picker */}
            <div>
              <label style={smallLabel}>Select Asset</label>
              <button
                type="button"
                onClick={() => { /* single-addr modal — disable toggle */ }}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14,
                  background: "var(--surface)", border: "1px solid var(--glass-border)",
                  display: "flex", alignItems: "center", gap: 12,
                  fontFamily: "inherit",
                }}
              >
                <img src={tokenIcon(active.symbol)} alt={active.symbol} width={32} height={32} style={{ borderRadius: "50%" }} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 700 }}>{active.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: 1, marginTop: 2, textTransform: "uppercase" }}>
                    {active.symbol} · {active.network}
                  </div>
                </div>
                {addresses.length > 1 && (
                  <select
                    value={idx}
                    onChange={(e) => setIdx(Number(e.target.value))}
                    style={{
                      background: "transparent", color: "var(--text-muted)", border: "none",
                      fontSize: 12, cursor: "pointer",
                    }}
                  >
                    {addresses.map((a, i) => (
                      <option key={i} value={i} style={{ background: "var(--bg)", color: "var(--text)" }}>{a.network}</option>
                    ))}
                  </select>
                )}
              </button>
            </div>

            {/* QR with corner brackets */}
            <div style={{
              position: "relative", margin: "0 auto",
              width: 240, height: 240, padding: 8,
              background: "#ffffff", borderRadius: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(var(--primary-rgb), 0.2)",
            }}>
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
              {qr ? (
                <img src={qr} alt="QR" width={200} height={200} style={{ display: "block" }} />
              ) : (
                <div style={{ color: "#999", fontSize: 12 }}>Generating…</div>
              )}
            </div>

            {/* Address + Copy */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 10px 10px 16px", borderRadius: 14,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", flex: 1, wordBreak: "break-all",
              }}>{shortAddr}</span>
              <button onClick={handleCopy} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 10,
                background: copied ? "rgba(16,185,129,0.18)" : "rgba(var(--primary-rgb), 0.08)",
                border: "1px solid rgba(var(--primary-rgb), 0.3)",
                color: "var(--primary)", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Network */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 6px var(--primary)" }} />
                Network: {active.network}
              </div>
            </div>

            {/* Warning */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px", borderRadius: 12,
              background: "rgba(234, 179, 8, 0.06)",
              border: "1px solid rgba(234, 179, 8, 0.25)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div style={{ fontSize: 11, color: "#eab308", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.5 }}>
                Only send {active.symbol} to this address. Other assets may result in permanent loss.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, borderRadius: 14,
                background: "transparent", border: "1px solid var(--glass-border)",
                color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, borderRadius: 14,
                background: "transparent",
                border: "1px solid var(--primary)",
                color: "var(--primary)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 0 20px rgba(var(--primary-rgb), 0.15)",
              }}>Done</button>
            </div>
          </>
        )}
      </div>
    </FancyModal>
  );
}

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const active = SUPPORTED_ASSETS_FULL.find((a) => a.symbol === token) || SUPPORTED_ASSETS_FULL[0];
  const otp = otpDigits.join("");

  // Fetch live price for this token
  useEffect(() => {
    fetch("/api/market/prices").then((r) => r.json()).then((j) => {
      const p = j?.prices?.[token]?.price;
      setPriceUsd(typeof p === "number" ? p : null);
    }).catch(() => setPriceUsd(null));
  }, [token]);

  const amountNum = Number(amount) || 0;
  const usdEq = priceUsd ? amountNum * priceUsd : 0;

  const sendOtp = async () => {
    setErr(null);
    try {
      const r = await fetch("/api/crypto/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "send" }) });
      if (!r.ok) throw new Error((await r.json()).error || r.status.toString());
      setOtpSent(true);
    } catch (e) { setErr((e as Error).message); }
  };

  const submit = async () => {
    if (otp.length < 6) { setErr("Enter the 6-digit code."); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/crypto/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, amount: amountNum, toAddress, otp }) });
      if (!r.ok) throw new Error((await r.json()).error || r.status.toString());
      setSuccess(true);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const pasteAddress = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setToAddress(t.trim());
    } catch { /* no permission */ }
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[i] = d;
    setOtpDigits(next);
    if (d && i < 5) {
      const nextEl = document.getElementById(`wd-otp-${i + 1}`);
      nextEl?.focus();
    }
  };

  if (success) {
    return (
      <FancyModal title="Withdrawal Submitted" subtitle="Processing on-chain" onClose={onClose}>
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(16,185,129,0.12)", border: "2px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ color: "var(--text)", fontSize: 15, marginBottom: 20, fontWeight: 600 }}>Your withdrawal is being processed.</div>
          <button onClick={onClose} style={{
            padding: "12px 32px", borderRadius: 14,
            background: "var(--primary)", color: "var(--bg)",
            fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
            border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>Done</button>
        </div>
      </FancyModal>
    );
  }

  const canContinue = !!toAddress && amountNum > 0;

  return (
    <FancyModal title="Withdraw Crypto" subtitle="Send crypto off-platform" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Asset picker */}
        <div>
          <label style={smallLabel}>Select Asset</label>
          <AssetPicker value={token} onChange={setToken} />
        </div>

        {/* Amount */}
        <div>
          <label style={smallLabel}>Amount to Withdraw</label>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px", borderRadius: 14,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
          }}>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              style={{
                flex: 1, minWidth: 0, width: "100%",
                background: "transparent", border: "none", outline: "none",
                color: "var(--text)", fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)",
              }}
            />
            <span style={{
              flexShrink: 0,
              color: "var(--primary)", fontSize: 15, fontWeight: 700, letterSpacing: 1,
            }}>{active.symbol}</span>
          </div>
          {priceUsd && amountNum > 0 && (
            <div style={{
              display: "inline-block", marginTop: 8, padding: "4px 10px",
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              borderRadius: 10, fontSize: 11, color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}>
              ≈ ${usdEq.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          )}
        </div>

        {/* Destination */}
        <div>
          <label style={smallLabel}>Destination Address</label>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 6px 4px 16px", borderRadius: 14,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
          }}>
            <input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder={`Paste ${active.symbol} address or scan`}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--text)", fontSize: 13, fontFamily: "var(--font-mono)",
                padding: "8px 0",
              }}
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              title="Scan QR"
              style={{
                background: "transparent", border: "none", padding: 8, cursor: "pointer",
                display: "flex", color: "var(--text-muted)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={pasteAddress}
              title="Paste"
              style={{
                background: "transparent", border: "none", padding: 8, cursor: "pointer",
                display: "flex", color: "var(--text-muted)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Network info */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>
            <span style={{ color: "var(--text-muted)" }}>Network</span>
            <span style={{ color: "var(--text)", fontWeight: 700 }}>{active.network}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>
            <span style={{ color: "var(--text-muted)" }}>Network Fee</span>
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Calculated on confirmation</span>
          </div>
        </div>

        {/* 2FA */}
        <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={smallLabel}>Enter 2FA Code</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            {otpDigits.map((d, i) => (
              <input
                key={i}
                id={`wd-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !d && i > 0) {
                    document.getElementById(`wd-otp-${i - 1}`)?.focus();
                  }
                }}
                onFocus={!otpSent ? sendOtp : undefined}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--surface)",
                  border: `1.5px solid ${d ? "var(--primary)" : "var(--glass-border)"}`,
                  color: d ? "var(--primary)" : "var(--text)",
                  textAlign: "center", fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)",
                  outline: "none", transition: "all 0.15s",
                  caretColor: "var(--primary)",
                }}
              />
            ))}
          </div>
          {otpSent && <div style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 10, letterSpacing: 1, textTransform: "uppercase" }}>Code sent to your email</div>}
        </div>

        {err && (
          <div style={{
            color: "#ef4444", fontSize: 12, textAlign: "center",
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
          }}>{err}</div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, borderRadius: 28,
            background: "transparent", border: "1px solid var(--glass-border)",
            color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button
            disabled={!canContinue || busy}
            onClick={otpSent && otp.length === 6 ? submit : sendOtp}
            style={{
              flex: 1.5, padding: 14, borderRadius: 28,
              background: canContinue && !busy ? "var(--primary)" : "var(--surface)",
              color: canContinue && !busy ? "var(--bg)" : "var(--text-muted)",
              fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              border: "none", cursor: canContinue && !busy ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: canContinue && !busy ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
            }}
          >
            {busy ? "Processing…" : otpSent && otp.length === 6 ? "Withdraw" : otpSent ? "Enter Code Above" : "Withdraw"}
            {(!busy && (!otpSent || otp.length === 6)) && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showScanner && (
        <QRScannerModal
          onScan={(text) => { setToAddress(text); setShowScanner(false); }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </FancyModal>
  );
}

function SwapModal({ onClose }: { onClose: () => void }) {
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [prices, setPrices] = useState<Record<string, { price: number }>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [slippage, setSlippage] = useState<0.1 | 0.5 | 1>(0.5);
  const [estimate, setEstimate] = useState<{
    receiveAmount?: number; rate?: number; fee?: number; feeUsd?: number; priceImpact?: number;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    fetch("/api/market/prices").then((r) => r.json()).then((j) => {
      setPrices(j?.prices || {});
    }).catch(() => setPrices({}));
  }, []);

  const amountNum = Number(amount) || 0;

  // Fetch live estimate from TygaBank on amount/pair change (debounced)
  useEffect(() => {
    if (amountNum <= 0 || fromCurrency === toCurrency) { setEstimate(null); return; }
    const t = setTimeout(() => {
      setEstimating(true);
      fetch("/api/crypto/swap-estimate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, toCurrency, fromCurrency }),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((j) => {
          const e = j?.estimate as Record<string, unknown> | undefined;
          if (!e) { setEstimate(null); return; }
          setEstimate({
            receiveAmount: Number(e.receiveAmount ?? e.toAmount ?? e.amountOut ?? 0),
            rate: Number(e.rate ?? e.price ?? 0),
            fee: Number(e.fee ?? e.networkFee ?? 0),
            feeUsd: Number(e.feeUsd ?? 0),
            priceImpact: Number(e.priceImpact ?? 0),
          });
        })
        .catch(() => setEstimate(null))
        .finally(() => setEstimating(false));
    }, 400);
    return () => clearTimeout(t);
  }, [amountNum, fromCurrency, toCurrency]);

  const fromActive = SUPPORTED_ASSETS_FULL.find((a) => a.symbol === fromCurrency) || SUPPORTED_ASSETS_FULL[0];
  const toActive = SUPPORTED_ASSETS_FULL.find((a) => a.symbol === toCurrency) || SUPPORTED_ASSETS_FULL[1];

  const fromPrice = prices[fromCurrency]?.price ?? 0;
  const toPrice = prices[toCurrency]?.price ?? 0;
  // Prefer TygaBank's rate when available; fall back to market rate for preview
  const rate = estimate?.rate || (toPrice > 0 ? fromPrice / toPrice : 0);
  const receiveAmount = estimate?.receiveAmount ?? (amountNum * rate);
  const fromUsd = amountNum * fromPrice;
  const toUsd = receiveAmount * toPrice;

  const flip = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); };

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/crypto/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, toCurrency, fromCurrency, slippage }),
      });
      if (!r.ok) throw new Error((await r.json()).error || r.status.toString());
      setSuccess(true);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  if (success) {
    return (
      <FancyModal title="Swap Submitted" subtitle="Exchange processing" onClose={onClose}>
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(16,185,129,0.12)", border: "2px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ color: "var(--text)", fontSize: 15, marginBottom: 20, fontWeight: 600 }}>Your swap has been submitted.</div>
          <button onClick={onClose} style={{
            padding: "12px 32px", borderRadius: 14,
            background: "var(--primary)", color: "var(--bg)",
            fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
            border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>Done</button>
        </div>
      </FancyModal>
    );
  }

  const canSwap = amountNum > 0 && fromCurrency !== toCurrency;

  return (
    <FancyModal title="Swap Crypto" subtitle="Instant asset exchange" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* YOU PAY */}
        <SwapCard
          label="You Pay"
          symbol={fromActive.symbol}
          amount={amount}
          onAmount={setAmount}
          usd={fromUsd}
          onPickAsset={setFromCurrency}
          balance={null}
          editable
        />

        {/* Flip button */}
        <div style={{ position: "relative", height: 0 }}>
          <button
            type="button"
            onClick={flip}
            style={{
              position: "absolute", left: "50%", top: -18, transform: "translateX(-50%)",
              width: 40, height: 40, borderRadius: "50%",
              background: "#f59e0b",
              border: "3px solid var(--bg)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(245,158,11,0.5)",
              zIndex: 2,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 10 12 5 17 10" /><polyline points="17 14 12 19 7 14" />
            </svg>
          </button>
        </div>

        {/* YOU RECEIVE */}
        <SwapCard
          label="You Receive"
          symbol={toActive.symbol}
          amount={receiveAmount > 0 ? receiveAmount.toFixed(4) : ""}
          onAmount={() => {}}
          usd={toUsd}
          onPickAsset={setToCurrency}
          balance={null}
          editable={false}
        />

        {/* Rate line */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 2px", borderTop: "1px solid rgba(255,255,255,0.05)",
          marginTop: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {estimating ? "Fetching rate…" : rate ? `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}` : "Enter an amount to see rate"}
          </div>
          <div style={{ fontSize: 9, color: estimate ? "var(--primary)" : "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>
            {estimate ? "Live" : "Preview"}
          </div>
        </div>

        {/* Slippage + Network */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div>
            <div style={{ ...smallLabel, marginBottom: 8 }}>Slippage</div>
            <div style={{ display: "flex", gap: 6 }}>
              {([0.1, 0.5, 1] as const).map((s) => {
                const active = slippage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    style={{
                      padding: "4px 10px", borderRadius: 8,
                      background: active ? "rgba(var(--primary-rgb), 0.15)" : "var(--surface)",
                      border: `1px solid ${active ? "var(--primary)" : "var(--glass-border)"}`,
                      color: active ? "var(--primary)" : "var(--text-muted)",
                      fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >{s}%</button>
                );
              })}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...smallLabel, marginBottom: 8 }}>Price Impact</div>
            {typeof estimate?.priceImpact === "number" && estimate.priceImpact > 0 ? (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 8,
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
                color: "var(--primary)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 6px var(--primary)" }} />
                {estimate.priceImpact.toFixed(2)}%
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>—</span>
            )}
          </div>
        </div>

        {/* Network fee (from TygaBank estimate) */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)",
          fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
        }}>
          <span style={{ color: "var(--text-muted)" }}>Network Fee</span>
          {typeof estimate?.fee === "number" && estimate.fee > 0 ? (
            <span style={{ color: "var(--primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              {estimate.fee} {fromActive.symbol}
              {estimate.feeUsd ? <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>≈ ${estimate.feeUsd.toFixed(2)}</span> : null}
            </span>
          ) : (
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              {estimating ? "Estimating…" : "Enter amount to see fee"}
            </span>
          )}
        </div>

        {err && (
          <div style={{
            color: "#ef4444", fontSize: 12, textAlign: "center",
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
          }}>{err}</div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, borderRadius: 28,
            background: "transparent", border: "1px solid var(--glass-border)",
            color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button
            disabled={!canSwap || busy}
            onClick={submit}
            style={{
              flex: 1.5, padding: 14, borderRadius: 28,
              background: canSwap && !busy ? "var(--primary)" : "var(--surface)",
              color: canSwap && !busy ? "var(--bg)" : "var(--text-muted)",
              fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              border: "none", cursor: canSwap && !busy ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: canSwap && !busy ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
            }}
          >
            {busy ? "Processing…" : "Confirm Swap"}
            {!busy && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </FancyModal>
  );
}

function SwapCard({
  label, symbol, amount, onAmount, usd, balance, editable,
}: {
  label: string; symbol: string; amount: string; onAmount: (v: string) => void;
  usd: number; balance: number | null; onPickAsset: (s: string) => void; editable: boolean;
}) {
  return (
    <div style={{
      padding: 16, borderRadius: 16,
      background: "var(--surface)", border: "1px solid var(--glass-border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ ...smallLabel, marginBottom: 0 }}>{label}</div>
        {balance !== null && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" /><circle cx="17" cy="14" r="1.5" />
            </svg>
            Bal: {balance} {symbol}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(var(--primary-rgb), 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <img src={tokenIcon(symbol)} alt={symbol} width={28} height={28} style={{ borderRadius: "50%" }} />
        </div>
        {editable ? (
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmount(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1, minWidth: 0, width: "100%",
              background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)",
            }}
          />
        ) : (
          <div style={{ flex: 1, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
            {amount || "0.00"} <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{symbol}</span>
          </div>
        )}
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
          = ${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      {editable && (
        <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700, marginTop: 8, textAlign: "right" }}>
          {symbol}
        </div>
      )}
    </div>
  );
}

/* ─── Receive Assets Panel (2 cols) ─── */
function ReceiveAssetsPanel({ addresses, onClaim }: { addresses: DepositAddress[]; onClaim: () => void }) {
  const [idx, setIdx] = useState(0);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const addr = addresses[idx];

  useEffect(() => {
    if (!addr?.address) { setQr(""); return; }
    QRCode.toDataURL(addr.address, {
      width: 260, margin: 1,
      color: { dark: "#10b981", light: "#00000000" },
    }).then(setQr).catch(() => setQr(""));
  }, [addr?.address]);

  const handleCopy = () => {
    if (!addr?.address) return;
    navigator.clipboard.writeText(addr.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28,
    }}>
      {/* Left: picker + address */}
      <div style={{ ...glassCard, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{
            fontSize: 13, fontWeight: 800, color: "var(--text)", letterSpacing: 1.5, textTransform: "uppercase",
          }}>Receive Assets</div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>

        {addresses.length === 0 ? (
          <div style={{ padding: "20px 0" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
              No deposit addresses claimed yet.
            </div>
            <button onClick={onClaim} style={primaryBtn}>Claim First Address</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Select Asset</div>
              <div style={{ position: "relative" }}>
                <select
                  value={idx}
                  onChange={(e) => setIdx(Number(e.target.value))}
                  style={{
                    width: "100%", padding: "12px 16px 12px 44px",
                    borderRadius: 12, background: "var(--surface)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text)", fontSize: 14, fontWeight: 600,
                    appearance: "none", outline: "none", cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {addresses.map((a, i) => (
                    <option key={i} value={i} style={{ background: "var(--bg)", color: "var(--text)" }}>
                      {a.network} ({a.network})
                    </option>
                  ))}
                </select>
                {addr && (
                  <img src={tokenIcon(addr.network)} alt={addr.network} width={22} height={22}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", borderRadius: "50%", pointerEvents: "none" }} />
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Deposit Address</div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 10px 10px 16px", borderRadius: 12,
                background: "var(--surface)", border: "1px solid var(--glass-border)",
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)",
                  flex: 1, wordBreak: "break-all",
                }}>
                  {addr ? `${addr.address.slice(0, 18)}…${addr.address.slice(-4)}` : ""}
                </span>
                <button onClick={handleCopy} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8,
                  background: copied ? "rgba(16,185,129,0.15)" : "rgba(var(--primary-rgb), 0.08)",
                  border: "1px solid rgba(var(--primary-rgb), 0.3)",
                  color: "var(--primary)", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: QR */}
      <div style={{
        ...glassCard, padding: 24,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, rgba(var(--primary-rgb), 0.04), rgba(var(--primary-rgb), 0.01))",
      }}>
        <div style={{
          width: 220, height: 220, borderRadius: 18,
          background: "rgba(var(--primary-rgb), 0.06)",
          border: "1px solid rgba(var(--primary-rgb), 0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 12,
          boxShadow: "0 0 40px rgba(var(--primary-rgb), 0.12), inset 0 0 20px rgba(var(--primary-rgb), 0.05)",
        }}>
          {qr ? (
            <img src={qr} alt="QR" width={200} height={200} />
          ) : (
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM18 14h3M14 18h3M18 18v3" />
            </svg>
          )}
        </div>
        <div style={{
          marginTop: 14, fontSize: 10, fontWeight: 600, letterSpacing: 2,
          color: "var(--text-muted)", textTransform: "uppercase",
        }}>
          Scan to deposit {addr ? addr.network : "any"} token
        </div>
      </div>
    </div>
  );
}

/* ─── Latest Activity Table ─── */
interface ActivityRow {
  id: string;
  hash: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  time: string;
}

function LatestActivityTable() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  useEffect(() => {
    fetch("/api/transactions?walletType=crypto&limit=8")
      .then((r) => r.ok ? r.json() : { transactions: [] })
      .then((j) => {
        const txs = (j.transactions || []) as Array<Record<string, unknown>>;
        setRows(txs.map((t, i) => ({
          id: String(t.id ?? i),
          hash: String(t.hash ?? t.id ?? "").slice(0, 8) + "…" + String(t.hash ?? t.id ?? "").slice(-4),
          type: String(t.type ?? "tx").toUpperCase(),
          asset: String(t.currency ?? t.token ?? "").toUpperCase() || "—",
          amount: Number(t.amount ?? 0),
          status: String(t.status ?? "").toUpperCase() || "PENDING",
          time: t.createdDate ? new Date(String(t.createdDate)).toLocaleTimeString() : "",
        })));
      })
      .catch(() => setRows([]));
  }, []);

  const statusColor = (s: string) => {
    if (/SUCCESS|COMPLETE|CONFIRMED/i.test(s)) return "#10b981";
    if (/PENDING|PROCESSING/i.test(s)) return "#eab308";
    if (/FAIL|REJECT|ERROR/i.test(s)) return "#ef4444";
    return "var(--text-muted)";
  };

  return (
    <div style={{ ...glassCard, padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Latest Activity
        </div>
        <a href="/transactions" style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
          color: "var(--primary)", textDecoration: "none",
        }}>View All</a>
      </div>

      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 0.8fr",
        gap: 16, padding: "0 4px 12px",
        borderBottom: "1px solid var(--glass-border)",
        fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
        color: "var(--text-muted)", textTransform: "uppercase",
      }}>
        <div>TX Hash</div><div>Type</div><div>Asset</div><div>Amount</div><div>Status</div><div>Time</div>
      </div>

      {/* Rows */}
      {rows === null ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <img src="/icon-192.png" alt="" width={48} height={48} style={{ opacity: 0.4, borderRadius: 12, marginBottom: 10 }} />
          <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>No activity yet</div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>Transactions will appear here once you start transacting.</div>
        </div>
      ) : rows.map((r) => {
        const up = r.amount >= 0;
        return (
          <div key={r.id} style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 0.8fr",
            gap: 16, padding: "14px 4px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            fontSize: 12, alignItems: "center",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{r.hash}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--text)", letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>
              {r.type}
            </div>
            <div style={{ color: "var(--text)", fontWeight: 600 }}>{r.asset}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: up ? "#10b981" : "#ef4444" }}>
              {up ? "+" : ""}{r.amount}
            </div>
            <div>
              <span style={{
                padding: "3px 10px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${statusColor(r.status)}33`,
                color: statusColor(r.status),
                fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              }}>{r.status}</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{r.time}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Off-Ramp to Bank modal ─── */
interface CustodialWalletLite { id?: string; token?: string; currency?: string; symbol?: string; balance?: number }
function OffRampToBankModal({ wallets, onClose }: { wallets: CustodialWalletLite[]; onClose: () => void }) {
  const [token, setToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<Array<{ id: string; fullName: string; bankName: string; accountNumberMasked: string; currency: string }>>([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [prices, setPrices] = useState<Record<string, { price: number }>>({});

  useEffect(() => {
    fetch("/api/market/prices").then((r) => r.json()).then((j) => setPrices(j?.prices || {}));
    fetch("/api/beneficiaries").then((r) => r.ok ? r.json() : { beneficiaries: [] }).then((j) => {
      const list = j.beneficiaries ?? [];
      setBeneficiaries(list);
      if (list[0]) setSelectedBank(list[0].id);
    });
  }, []);

  const activeToken = SUPPORTED_ASSETS_FULL.find((a) => a.symbol === token) || SUPPORTED_ASSETS_FULL[0];
  const balance = wallets.find((w) => String(w.token || w.currency || w.symbol).toUpperCase() === token)?.balance ?? 0;
  const amountNum = Number(amount) || 0;
  const price = prices[token]?.price ?? 1;
  const usdEquiv = amountNum * price;
  const offRampFee = 5.00;
  const bankReceives = Math.max(0, usdEquiv - offRampFee);
  const activeBank = beneficiaries.find((b) => b.id === selectedBank);
  const canSubmit = amountNum > 0 && amountNum <= balance && !!selectedBank;

  async function submit() {
    setErr(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const r = await fetch("/api/crypto/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, amount: amountNum, toBeneficiaryId: selectedBank, offRamp: true }),
      });
      if (!r.ok) { setErr("Off-ramp failed."); return; }
      setDone(true);
      setTimeout(onClose, 1200);
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div onClick={onClose} className="fancy-modal-backdrop" style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div onClick={(e) => e.stopPropagation()} className="fancy-modal-surface" style={{
          width: "100%", maxWidth: 420, border: "1px solid rgba(var(--primary-rgb), 0.3)",
          borderRadius: 24, padding: "40px 28px", textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
            background: "rgba(16,185,129,0.12)", border: "2px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600 }}>Off-ramp started.</div>
        </div>
      </div>
    );
  }

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
        borderRadius: 24, padding: "26px 28px 22px",
        boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.15)",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: 0.3, textShadow: "0 0 24px rgba(var(--primary-rgb), 0.4)" }}>Off-Ramp to Bank</div>
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>Crypto to bank account</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
        </div>

        {/* ASSET & AMOUNT */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={smallLabel}>Asset & Amount</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Bal: {balance.toLocaleString()} {token}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--glass-border)", marginBottom: 18, alignItems: "center" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button type="button" onClick={() => setTokenPickerOpen((o) => !o)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
              background: "var(--bg)", border: "1px solid var(--glass-border)",
              borderRadius: 20, cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
              fontSize: 13, fontWeight: 700,
            }}>
              <img src={tokenIcon(token)} alt={token} width={20} height={20} style={{ borderRadius: "50%" }} />
              {token}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {tokenPickerOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10,
                background: "var(--bg)", border: "1px solid var(--glass-border)",
                borderRadius: 12, overflow: "hidden", minWidth: 120, boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              }}>
                {SUPPORTED_ASSETS_FULL.map((a) => (
                  <button key={a.symbol} type="button" onClick={() => { setToken(a.symbol); setTokenPickerOpen(false); }}
                    style={{
                      width: "100%", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8,
                      background: token === a.symbol ? "rgba(var(--primary-rgb), 0.1)" : "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}>
                    <img src={tokenIcon(a.symbol)} alt={a.symbol} width={16} height={16} style={{ borderRadius: "50%" }} />
                    {a.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="number" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0"
            style={{
              flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontSize: 24, fontWeight: 700,
              fontFamily: "var(--font-mono)", textAlign: "right",
            }}
          />
          <span style={{ flexShrink: 0, color: "var(--primary)", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>{activeToken.symbol}</span>
        </div>

        {/* DESTINATION ACCOUNT */}
        <label style={smallLabel}>Destination Account</label>
        {beneficiaries.length === 0 ? (
          <div style={{ padding: 14, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--glass-border)", fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
            No bank accounts linked. <a href="/e-wallet/beneficiaries" style={{ color: "var(--primary)" }}>Add one →</a>
          </div>
        ) : (
          <div style={{ position: "relative", marginBottom: 18 }}>
            <button type="button" onClick={() => setBankPickerOpen((o) => !o)} style={{
              width: "100%", padding: "14px 18px", borderRadius: 28,
              background: "var(--surface)", border: "1px solid var(--primary)",
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(var(--primary-rgb), 0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11" />
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: "left", color: "var(--text)", fontSize: 14, fontWeight: 700 }}>
                {activeBank ? `${activeBank.bankName} •••• ${activeBank.accountNumberMasked.slice(-4)}` : "Choose account"}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {bankPickerOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10,
                background: "var(--bg)", border: "1px solid var(--glass-border)",
                borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              }}>
                {beneficiaries.map((b) => (
                  <button key={b.id} type="button" onClick={() => { setSelectedBank(b.id); setBankPickerOpen(false); }}
                    style={{
                      width: "100%", padding: "10px 16px", display: "block", textAlign: "left",
                      background: b.id === selectedBank ? "rgba(var(--primary-rgb), 0.08)" : "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      color: "var(--text)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    }}>
                    {b.bankName} •••• {b.accountNumberMasked.slice(-4)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Steps */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6,
          padding: "14px 6px", marginBottom: 14,
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 18, left: "10%", right: "10%", height: 1, borderTop: "1px dashed rgba(var(--primary-rgb), 0.3)", zIndex: 0 }} />
          {[
            { label: "Convert", sub: "~30s", active: true },
            { label: "Settle", sub: "~45s", active: false },
            { label: "Deposit", sub: "1-3D", active: false },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", margin: "0 auto",
                background: s.active ? "var(--primary)" : "var(--surface)",
                border: s.active ? "2px solid var(--primary)" : "1px solid var(--glass-border)",
                boxShadow: s.active ? "0 0 10px var(--primary)" : "none",
              }} />
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: s.active ? "var(--primary)" : "var(--text-muted)", textTransform: "uppercase", marginTop: 8 }}>
                {s.label} ({s.sub})
              </div>
            </div>
          ))}
        </div>

        {/* Fee + Receives */}
        <div style={{ padding: "14px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--glass-border)", marginBottom: 16, fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>Off-Ramp Fee</span>
            <span style={{ color: "#eab308", fontFamily: "var(--font-mono)", fontWeight: 700 }}>${offRampFee.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4, paddingTop: 10 }}>
            <span style={{ color: "var(--text)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Bank Receives</span>
            <span style={{ color: "var(--primary)", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 15 }}>${bankReceives.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px", borderRadius: 20,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              color: "var(--primary)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              1-2 Business Days
            </span>
          </div>
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
          <button onClick={submit} type="button" disabled={!canSubmit || loading}
            style={{
              flex: 1.5, padding: 14, borderRadius: 28,
              background: canSubmit && !loading ? "var(--primary)" : "var(--surface)",
              color: canSubmit && !loading ? "var(--bg)" : "var(--text-muted)",
              fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              border: "none", cursor: canSubmit && !loading ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: canSubmit && !loading ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
            }}>
            {loading ? "Starting…" : "Start Sync"}
            {!loading && canSubmit && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CryptoPage() {
  return (
    <Suspense fallback={null}>
      <CryptoPageInner />
    </Suspense>
  );
}

function CryptoPageInner() {
  const { walletsByType, loading: userLoading, refresh } = useUser();
  const cryptoWallet = walletsByType.crypto;

  const [wallets, setWallets] = useState<CustodialWallet[] | null>(null);
  const [addresses, setAddresses] = useState<DepositAddress[] | null>(null);
  const [prices, setPrices] = useState<Record<string, MarketPrice>>({});
  const [err, setErr] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [creatingCrypto, setCreatingCrypto] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [showCardLoad, setShowCardLoad] = useState(false);
  const [showBankWithdraw, setShowBankWithdraw] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showCreateWallet, setShowCreateWallet] = useState(false);

  const searchParams = useSearchParams();
  useEffect(() => {
    const action = searchParams?.get("action");
    if (action === "deposit") setShowDeposit(true);
    else if (action === "withdraw") setShowWithdraw(true);
    else if (action === "swap") setShowSwap(true);
    else if (action === "buy") setShowBuy(true);
  }, [searchParams]);

  const loadWallets = useCallback(async () => {
    try {
      const r = await fetch("/api/crypto/wallets");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || String(r.status));
      setWallets(j.wallets ?? []);
    } catch (e) { setErr((e as Error).message); }
  }, []);

  const loadAddresses = useCallback(async () => {
    try {
      const r = await fetch("/api/crypto/deposit-addresses");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || String(r.status));
      setAddresses(j.addresses ?? []);
    } catch (e) { setErr((e as Error).message); }
  }, []);

  useEffect(() => {
    if (cryptoWallet) {
      loadWallets();
      loadAddresses();
    }
  }, [cryptoWallet, loadWallets, loadAddresses]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/market/prices");
        const j = await r.json();
        if (!cancelled && j?.prices) setPrices(j.prices);
      } catch { /* ignore */ }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const createCryptoWallet = async () => {
    setCreatingCrypto(true);
    try {
      const r = await fetch("/api/users/create-crypto-wallet", { method: "POST" });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      await refresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setCreatingCrypto(false); }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const r = await fetch("/api/crypto/sync", { method: "POST" });
      if (!r.ok) throw new Error((await r.json()).error || String(r.status));
      await Promise.all([loadWallets(), refresh()]);
    } catch (e) { setErr((e as Error).message); }
    finally { setSyncing(false); }
  };

  // Portfolio metrics (aggregated from holdings × live prices) — hoisted above any early returns (Rules of Hooks)
  const portfolio = useMemo(() => {
    const symbols = ["BTC", "ETH", "SOL", "USDT", "BNB", "USDC"];
    let total = 0;
    let weighted = 0;
    for (const s of symbols) {
      const m = prices[s];
      const w = wallets?.find((x) => String(x.token || x.currency || x.symbol).toUpperCase() === s);
      const bal = typeof w?.balance === "number" ? w.balance : 0;
      if (!m) continue;
      const v = bal * m.price;
      total += v;
      weighted += v * m.change24h;
    }
    return { total, change24h: total > 0 ? weighted / total : 0 };
  }, [prices, wallets]);

  if (userLoading) {
    return <div style={{ ...glassCard, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  }

  /* No crypto wallet */
  if (!cryptoWallet) {
    return (
      <div style={{ ...glassCard, padding: "60px 40px", textAlign: "center", maxWidth: 520, margin: "60px auto" }}>
        <img src="/crypto-icon.gif" alt="Crypto" width={64} height={64} style={{ marginBottom: 24, objectFit: "contain" }} />
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>Create Crypto Wallet</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 28px" }}>
          Set up your crypto wallet to deposit, withdraw, and swap digital assets.
        </p>
        {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{err}</div>}
        <button style={primaryBtn} disabled={creatingCrypto} onClick={createCryptoWallet}>
          {creatingCrypto ? "Creating…" : "Create Crypto Wallet"}
        </button>
      </div>
    );
  }

  const walletId = (cryptoWallet?.id || "").toString().slice(0, 12).toUpperCase() || "—";
  const portfolioUp = portfolio.change24h >= 0;

  return (
    <>
      {/* ─── Hero Portfolio Card ─── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 24, padding: "28px 32px", marginBottom: 24,
        minHeight: 180,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              fontSize: 11, letterSpacing: 2, color: "var(--primary)",
              textTransform: "uppercase", fontWeight: 600, marginBottom: 10,
            }}>Crypto Portfolio</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{
                fontSize: 52, fontWeight: 800, color: "var(--primary)",
                fontFamily: "var(--font-mono)", lineHeight: 1,
                textShadow: "0 0 40px rgba(var(--primary-rgb), 0.3)",
              }}>
                ${portfolio.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: portfolioUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                border: `1px solid ${portfolioUp ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: portfolioUp ? "#10b981" : "#ef4444",
                fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)",
              }}>
                {portfolioUp ? "+" : ""}{portfolio.change24h.toFixed(1)}% 24H
              </div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(cryptoWallet?.id || ""); }}
              title="Copy wallet ID"
              style={{
                marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "5px 12px", borderRadius: 16,
                background: "var(--surface)", border: "1px solid var(--glass-border)",
                color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)",
                letterSpacing: 1, cursor: "pointer",
              }}
            >
              CW-{walletId}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1px solid rgba(var(--primary-rgb), 0.2)",
            }} />
            <div style={{
              position: "absolute", inset: 12, borderRadius: "50%",
              background: "radial-gradient(circle, var(--primary) 0%, rgba(16,185,129,0.4) 60%, transparent 100%)",
              boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.6), inset 0 0 30px rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {err && <div style={{ ...glassCard, color: "var(--danger)", marginBottom: 16, fontSize: 13 }}>{err}</div>}

      {/* ─── Action Grid (2 rows × 4 cols) ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28,
      }}>
        {[
          { label: "Deposit", onClick: () => setShowDeposit(true), icon: (<><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>) },
          { label: "Withdraw", onClick: () => setShowWithdraw(true), icon: (<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>) },
          { label: "Buy", onClick: () => setShowBuy(true), icon: (<><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>) },
          { label: syncing ? "Syncing…" : "Sync", onClick: sync, icon: (<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>) },
          { label: "Send to Card", onClick: () => setShowCardLoad(true), icon: (<><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>) },
          { label: "Send to Bank", onClick: () => setShowBankWithdraw(true), icon: (<><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></>) },
          { label: "Swap", onClick: () => setShowSwap(true), icon: (<><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>) },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "18px 12px", borderRadius: 18,
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              color: "var(--text)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.background = "var(--glass-bg)"; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {a.icon}
            </svg>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Asset Cards (3×2) ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28,
      }}>
        {["BTC", "ETH", "SOL", "USDT", "BNB", "USDC"].map((sym) => {
          const m = prices[sym];
          const holding = wallets?.find((w) => String(w.token || w.currency || w.symbol).toUpperCase() === sym)?.balance;
          const hAmount = typeof holding === "number" ? holding : 0;
          if (!m) {
            return (
              <div key={sym} style={{
                background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                borderRadius: 18, padding: 20, minHeight: 150,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", fontSize: 12,
              }}>Loading {sym}…</div>
            );
          }
          return (
            <AssetCard
              key={sym}
              symbol={sym}
              name={m.name}
              holding={hAmount}
              price={m.price}
              change24h={m.change24h}
              sparkline={m.sparkline}
            />
          );
        })}
      </div>

      {/* ─── Receive Assets + QR (2 cols) ─── */}
      <ReceiveAssetsPanel addresses={addresses || []} onClaim={() => setShowClaim(true)} />

      {/* ─── Latest Activity Table ─── */}
      <LatestActivityTable />

      {/* Modals */}
      {showDeposit && <DepositModal addresses={addresses || []} onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
      {showSwap && <SwapModal onClose={() => setShowSwap(false)} />}
      {showBuy && <SwapModal onClose={() => setShowBuy(false)} />}
      {showCardLoad && <CryptoToCardModal onClose={() => setShowCardLoad(false)} />}
      {showBankWithdraw && <OffRampToBankModal wallets={wallets || []} onClose={() => setShowBankWithdraw(false)} />}
      {(showClaim || showCreateWallet) && (
        <ActivateAssetsModal
          addresses={addresses || []}
          wallets={wallets || []}
          onClose={() => { setShowClaim(false); setShowCreateWallet(false); }}
          onActivated={() => { loadAddresses(); loadWallets(); }}
        />
      )}
    </>
  );
}
