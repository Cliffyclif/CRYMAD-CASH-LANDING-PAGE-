"use client";

import Link from "next/link";
import { formatMoney, useUser } from "@/components/providers/UserProvider";

function fmtBalance(amount: number, currency: string) {
  if (currency === "POINTS") return `${amount.toLocaleString()} pts`;
  return formatMoney(amount, currency);
}

export function WalletCapsules() {
  const { walletsByType, wallets, loading } = useUser();

  const ewallet = walletsByType.ewallet;
  const crypto = walletsByType.crypto;
  const card = walletsByType.card;
  const rewards = walletsByType.rewards;

  const totalUsd = wallets
    .filter((w) => w.currency === "USD")
    .reduce((sum, w) => sum + (w.balance ?? 0), 0);

  const skeleton = loading && wallets.length === 0;

  return (
    <div className="wallets-section">
      <div className="wallets-row">
        <div className="wallet-connection"><div className="connection-dot" /></div>

        {/* E-Wallet */}
        <Link href="/e-wallet" className="wallet-capsule wallet-ewallet">
          <div className="capsule-circle">
            <svg className="capsule-ring" viewBox="0 0 180 180">
              <circle className="ring-bg" cx="90" cy="90" r="85" />
              <circle className="ring-fg" cx="90" cy="90" r="85" strokeDasharray="534" strokeDashoffset="134" />
            </svg>
            <div className="capsule-inner">
              <div className="capsule-icon">
                <svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" /><circle cx="17" cy="14" r="1.5" /></svg>
              </div>
              <div className="capsule-balance">
                {skeleton ? "…" : fmtBalance(ewallet?.balance ?? 0, ewallet?.currency ?? "USD")}
              </div>
              <div className="capsule-name">E-Wallet</div>
            </div>
          </div>
          <div className="capsule-subtitle">
            <span>{ewallet?.name ?? "Primary Wallet"}</span><br />
            <span className="capsule-link">View →</span>
          </div>
        </Link>

        <div className="wallet-connection"><div className="connection-dot" /></div>

        {/* Crypto */}
        <Link href="/crypto" className="wallet-capsule wallet-crypto">
          <div className="capsule-circle">
            <svg className="capsule-ring" viewBox="0 0 180 180">
              <circle className="ring-bg" cx="90" cy="90" r="85" />
              <circle className="ring-fg" cx="90" cy="90" r="85" strokeDasharray="534" strokeDashoffset="134" />
            </svg>
            <div className="capsule-inner">
              <div className="capsule-icon">
                <img src="/crypto-icon.gif" alt="Crypto" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div className="capsule-balance">
                {skeleton ? "…" : crypto ? fmtBalance(crypto.balance, crypto.currency) : "$0.00"}
              </div>
              <div className="capsule-name">Crypto</div>
            </div>
          </div>
          <div className="capsule-subtitle">
            <span>{crypto ? crypto.name : "Not yet created"}</span><br />
            <span className="capsule-link">{crypto ? "View →" : "Create →"}</span>
          </div>
        </Link>

        {/* Card */}
        <Link href="/cards" className="wallet-capsule wallet-card">
          <div className="capsule-circle">
            <svg className="capsule-ring" viewBox="0 0 180 180">
              <circle className="ring-bg" cx="90" cy="90" r="85" />
              <circle className="ring-fg" cx="90" cy="90" r="85" strokeDasharray="534" strokeDashoffset="134" />
            </svg>
            <div className="capsule-inner">
              <div className="capsule-icon">
                <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </div>
              <div className="capsule-balance">
                {skeleton ? "…" : card ? fmtBalance(card.balance, card.currency) : "$0.00"}
              </div>
              <div className="capsule-name">Card</div>
            </div>
          </div>
          <div className="capsule-subtitle">
            <span>{card ? card.name : "No card yet"}</span><br />
            <span className="capsule-link">{card ? "View →" : "Order →"}</span>
          </div>
        </Link>
      </div>

      {/* Total */}
      <div className="total-balance-bar">
        <span className="label">Total Balance (USD wallets):</span>
        <span className="amount">{skeleton ? "…" : formatMoney(totalUsd, "USD")}</span>
        {rewards && (
          <span style={{ marginLeft: 16, fontSize: 12, opacity: 0.7 }}>
            · {rewards.balance.toLocaleString()} reward points
          </span>
        )}
      </div>
    </div>
  );
}
