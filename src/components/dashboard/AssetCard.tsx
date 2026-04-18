"use client";

import { tokenIcon } from "@/lib/tokens/icons";

interface Props {
  symbol: string;
  name: string;
  holding: number;          // user's holding in token units
  price: number;            // USD per token
  change24h: number;        // percentage
  sparkline: number[];      // hourly/daily prices
}

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  if (points.length < 2) {
    return <div style={{ height: 40, borderBottom: "1px solid rgba(255,255,255,0.05)" }} />;
  }
  const w = 260;
  const h = 40;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = w / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const color = up ? "#10b981" : "#ef4444";
  const gradId = `g-${up ? "u" : "d"}-${Math.random().toString(36).slice(2, 7)}`;
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AssetCard({ symbol, name, holding, price, change24h, sparkline }: Props) {
  const value = holding * price;
  const up = change24h >= 0;
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 18,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            fontSize: 18, fontWeight: 800, color: "var(--primary)",
            textTransform: "uppercase", letterSpacing: 1.5,
          }}>{name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, marginTop: 2 }}>{symbol}</div>
        </div>
        <img src={tokenIcon(symbol)} alt={symbol} width={28} height={28} style={{ borderRadius: "50%", opacity: 0.9 }} />
      </div>

      {/* Live market price */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)",
        }}>
          ${price.toLocaleString(undefined, {
            minimumFractionDigits: price >= 1 ? 2 : 4,
            maximumFractionDigits: price >= 1 ? 2 : 6,
          })}
        </div>
        <div style={{
          padding: "3px 10px", borderRadius: 20,
          background: up ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          color: up ? "#10b981" : "#ef4444",
          fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
          border: `1px solid ${up ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          whiteSpace: "nowrap",
        }}>
          {up ? "+" : ""}{change24h.toFixed(2)}%
        </div>
      </div>

      {/* Holding */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {holding > 0 ? (
            <>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>
                {holding.toLocaleString(undefined, { maximumFractionDigits: 4 })} {symbol}
              </span>
              <span style={{ marginLeft: 8 }}>· ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>No holdings</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 6, marginLeft: -20, marginRight: -20, marginBottom: -20 }}>
        <Sparkline points={sparkline} up={up} />
      </div>
    </div>
  );
}
