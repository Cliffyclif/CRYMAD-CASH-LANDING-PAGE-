"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney } from "@/components/providers/UserProvider";
import { useLanguage } from "@/i18n/LanguageContext";

type Tx = {
  id: string;
  status: string;
  type: string;
  side?: "credit" | "debit";
  amount: number;
  fee?: number;
  currency?: string;
  walletType?: string;
  reference?: string;
  createdDate: string;
  completedDate?: string;
  orderId?: string;
  externalTransactionId?: string;
};

export function ActivityFeed({ walletType, limit = 6 }: { walletType?: string; limit?: number }) {
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const qs = new URLSearchParams();
    if (walletType) qs.set("walletType", walletType);
    qs.set("limit", String(limit));
    fetch(`/api/transactions?${qs.toString()}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || String(r.status));
        return r.json();
      })
      .then((j) => setTxs(j.transactions ?? []))
      .catch((e) => setError(e.message));
  }, [walletType, limit]);

  if (error) {
    return (
      <div className="activity-section">
        <div className="section-header">
          <h2>{t("app.activity.title")}</h2>
        </div>
        <div style={{ padding: 20, opacity: 0.6, fontSize: 14 }}>Could not load activity. ({error})</div>
      </div>
    );
  }

  if (txs === null) {
    return (
      <div className="activity-section">
        <div className="section-header">
          <h2>{t("app.activity.title")}</h2>
        </div>
        <div className="timeline">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="tx-card" style={{ opacity: 0.35 }}>
              <div className="tx-status pending" />
              <div className="tx-icon" />
              <div className="tx-details"><div className="tx-ref">Loading…</div></div>
              <div className="tx-amount">···</div>
              <div className="tx-date">···</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (txs.length === 0) {
    return (
      <div className="activity-section">
        <div className="section-header">
          <h2>{t("app.activity.title")}</h2>
        </div>
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <img
            src="/icon-192.png"
            alt="Crymad Cash"
            width={64}
            height={64}
            style={{
              marginBottom: 14,
              borderRadius: 18,
              opacity: 0.55,
              filter: "drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.25))",
            }}
          />
          <div style={{ fontSize: 14, marginBottom: 6, color: "var(--text)", fontWeight: 600 }}>No transactions yet</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Your recent activity will appear here once you start transacting.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-section">
      <div className="section-header">
        <h2>{t("app.activity.title")}</h2>
        <Link href="/transactions">View All →</Link>
      </div>
      <div className="timeline">
        {txs.slice(0, limit).map((tx) => {
          const statusClass =
            /complete|success|confirmed/i.test(tx.status)
              ? "complete"
              : /fail|reject|cancel/i.test(tx.status)
                ? "failed"
                : "pending";
          const isDebit = tx.side === "debit" || tx.amount < 0;
          const absAmount = Math.abs(tx.amount);
          const d = new Date(tx.createdDate);
          const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

          return (
            <div key={tx.id} className="tx-card">
              <div className={`tx-status ${statusClass}`} />
              <div className="tx-icon">
                {isDebit ? (
                  <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
                )}
              </div>
              <div className="tx-details">
                <div className="tx-ref">{tx.reference || tx.externalTransactionId || tx.id}</div>
                <div className="tx-desc">
                  {prettyType(tx.type)}
                  {tx.walletType ? ` · ${tx.walletType}` : ""}
                </div>
              </div>
              <div className={`tx-amount ${isDebit ? "debit" : "credit"}`}>
                {isDebit ? "-" : "+"}{formatMoney(absAmount, tx.currency || "USD")}
              </div>
              <div className="tx-date">
                {date}
                <span className="time">{time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function prettyType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
