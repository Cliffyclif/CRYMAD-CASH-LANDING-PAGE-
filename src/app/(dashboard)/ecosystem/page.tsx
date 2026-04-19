"use client";

type Segment = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  accent: string;
  shadowTint: string;
  features: string[];
  logo: string | null;
  monogram?: string;
  logoScale?: number;
};

/** 4 outer quadrants of the ecosystem "pie". Order matters — matches grid positions below. */
const QUADRANTS: Segment[] = [
  {
    id: "crymadx",
    name: "CrymadX",
    tagline: "Decentralized Exchange",
    description:
      "Decentralized crypto exchange — buy, sell, trade, P2P, API access, and advanced portfolio management with savings and staking.",
    url: "https://www.crymadx.io",
    accent: "#10b981",
    shadowTint: "#a7f3d0",
    features: ["Trading", "P2P", "Staking", "Savings"],
    logo: "/ecosystem/crymadx-logo.jpg",
  },
  {
    id: "crymadcash",
    name: "CrymadCash",
    tagline: "Digital Banking",
    description:
      "Crypto and fiat integration, global payments, virtual cards, and full-featured digital banking services — all in one place.",
    url: "https://crymadcash.com",
    accent: "#06b6d4",
    shadowTint: "#67e8f9",
    features: ["Virtual Cards", "Global Pay", "Fiat Ramp", "Custody"],
    logo: "/ecosystem/crymadcash-logo.png",
  },
  {
    id: "pipzen",
    name: "Pipzen",
    tagline: "Prop Trading Firm",
    description:
      "Prop trading firm offering trader funding, crypto funding programs, and instant funding opportunities with generous profit splits.",
    url: "https://www.pipzen.io",
    accent: "#a855f7",
    shadowTint: "#d8b4fe",
    features: ["Trader Funding", "Crypto Programs", "Instant", "Profit Split"],
    logo: "/ecosystem/pipzen-logo.png",
  },
  {
    id: "crymadhash",
    name: "CrymadHash",
    tagline: "Crypto Mining",
    description:
      "Crypto mining platform with high-level equipment, mining autopilot, and automatic payouts — passive hash power at scale.",
    url: "https://crymadhsh.tech/",
    accent: "#f59e0b",
    shadowTint: "#fcd34d",
    features: ["Cloud Mining", "Auto-Payout", "Pools", "Hash Power"],
    logo: "/ecosystem/crymadhash-logo.png",
    logoScale: 1.5,
  },
];

/** The 5th (center) segment — brain of the ecosystem */
const HUB: Segment = {
  id: "cryptomadness",
  name: "Cryptomadness",
  tagline: "Central Intelligence",
  description:
    "The brain of the ecosystem — central intelligence connecting all platforms with real-time data, unified identity, and cross-platform orchestration.",
  url: "https://www.cryptomadness.info",
  accent: "#10b981",
  shadowTint: "#a7f3d0",
  features: ["Hub", "Identity", "Orchestration", "Real-time"],
  logo: "/ecosystem/cryptomadness-hub-logo.png",
};

/** Big-radius corner per quadrant — points toward center of the pie */
const CORNERS: Record<0 | 1 | 2 | 3, string> = {
  0: "520px 20px 20px 20px", // top-left quadrant → big radius on top-left (outer corner)
  1: "20px 520px 20px 20px", // top-right → big on top-right
  2: "20px 20px 20px 520px", // bottom-left → big on bottom-left
  3: "20px 20px 520px 20px", // bottom-right → big on bottom-right
};

/** Tooltip position per quadrant — push outward so it doesn't cover the center */
const TOOLTIP_POS: Record<0 | 1 | 2 | 3, "left" | "right" | "left-bottom" | "right-bottom"> = {
  0: "left",
  1: "right",
  2: "left-bottom",
  3: "right-bottom",
};

export default function EcosystemPage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <style>{`
        .pie-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 0 120px;
          position: relative;
        }
        .pie {
          position: relative;
          display: grid;
          grid-template-columns: 520px 520px;
          grid-template-rows: 520px 520px;
          gap: 14px;
        }

        .seg-card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.25s, border-color 0.25s, box-shadow 0.25s;
          text-decoration: none;
        }
        .seg-card .seg-logo-wrap {
          width: 50%;
          height: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        /* Logo offset per quadrant — push logo OUTWARD (toward the rounded corner) */
        .seg-q0 .seg-logo-wrap { margin: -12% -12% 0 0; }
        .seg-q1 .seg-logo-wrap { margin: -12% 0 0 -12%; }
        .seg-q2 .seg-logo-wrap { margin: 0 -12% -12% 0; }
        .seg-q3 .seg-logo-wrap { margin: 0 0 -12% -12%; }

        .seg-card:hover {
          transform: scale(1.08);
          z-index: 5;
          background: color-mix(in srgb, var(--seg-accent) 15%, var(--glass-bg));
          border-color: var(--seg-accent);
          box-shadow:
            1px 1px 0 var(--seg-tint),
            2px 2px 0 var(--seg-accent),
            3px 3px 0 var(--seg-accent),
            4px 4px 0 var(--seg-accent),
            5px 5px 0 var(--seg-accent);
        }
        .seg-card:hover .seg-logo-wrap { transform: scale(1.1); }

        .seg-monogram {
          font-size: 140px;
          font-weight: 900;
          letter-spacing: -2px;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
        }

        /* Center Hub — circular badge on top of the pie junction */
        .pie-hub {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: var(--bg);
          border: 2px solid rgba(var(--primary-rgb), 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.25s, box-shadow 0.25s;
          box-shadow: 0 0 36px rgba(var(--primary-rgb), 0.35),
                      inset 0 0 20px rgba(var(--primary-rgb), 0.15);
        }
        .pie-hub:hover {
          transform: translate(-50%, -50%) scale(1.1);
          border-color: var(--primary);
          box-shadow: 0 0 56px rgba(var(--primary-rgb), 0.55),
                      inset 0 0 24px rgba(var(--primary-rgb), 0.25);
        }
        .pie-hub img {
          width: 72%;
          height: 72%;
          object-fit: contain;
        }

        /* Tooltip */
        .seg-tooltip {
          position: absolute;
          width: 280px;
          padding: 16px 18px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--seg-accent);
          border-radius: 14px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s, transform 0.25s;
          z-index: 20;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
        }
        .seg-card:hover .seg-tooltip,
        .pie-hub:hover .seg-tooltip {
          opacity: 1;
          pointer-events: auto;
        }

        /* Transparent bridge that spans the gap between segment and tooltip —
           keeps the hover target continuous so the tooltip doesn't disappear
           while the mouse crosses over to it. */
        .seg-tooltip::before {
          content: "";
          position: absolute;
          display: block;
        }
        /* Left-side tooltips (q0, q2) → bridge extends to the right (toward segment) */
        .seg-q0 .seg-tooltip::before,
        .seg-q2 .seg-tooltip::before {
          top: 0; right: -20px; width: 20px; height: 100%;
        }
        /* Right-side tooltips (q1, q3) → bridge extends to the left */
        .seg-q1 .seg-tooltip::before,
        .seg-q3 .seg-tooltip::before {
          top: 0; left: -20px; width: 20px; height: 100%;
        }
        /* Hub tooltip appears below → bridge extends upward */
        .pie-hub .seg-tooltip::before {
          left: 0; top: -20px; width: 100%; height: 20px;
        }

        /* Tooltip positions — push outward, away from pie center */
        .seg-q0 .seg-tooltip { right: calc(100% + 16px); top: 0; }
        .seg-q0:hover .seg-tooltip { transform: translateX(0); }

        .seg-q1 .seg-tooltip { left: calc(100% + 16px); top: 0; }
        .seg-q1:hover .seg-tooltip { transform: translateX(0); }

        .seg-q2 .seg-tooltip { right: calc(100% + 16px); bottom: 0; }
        .seg-q2:hover .seg-tooltip { transform: translateX(0); }

        .seg-q3 .seg-tooltip { left: calc(100% + 16px); bottom: 0; }
        .seg-q3:hover .seg-tooltip { transform: translateX(0); }

        /* Hub tooltip — appears below the hub */
        .pie-hub .seg-tooltip {
          top: calc(100% + 16px);
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
        }
        .pie-hub:hover .seg-tooltip {
          transform: translateX(-50%) translateY(0);
        }

        @media (max-width: 760px) {
          .pie { grid-template-columns: 170px 170px; grid-template-rows: 170px 170px; }
          .pie-hub { width: 110px; height: 110px; }
          .seg-tooltip { width: 240px; }
          .seg-monogram { font-size: 60px; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid rgba(var(--primary-rgb), 0.3)",
            background: "rgba(var(--primary-rgb), 0.08)",
            color: "var(--primary)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }} />
          Cryptomadness Financial Ecosystem
        </div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 900,
            margin: "0 0 10px",
            color: "var(--text)",
            letterSpacing: -1.2,
            lineHeight: 1.05,
          }}
        >
          Five Platforms.{" "}
          <span style={{ color: "var(--primary)", textShadow: "0 0 30px rgba(var(--primary-rgb), 0.4)" }}>
            One Ecosystem.
          </span>
        </h1>
        <p
          style={{
            maxWidth: 540,
            margin: "0 auto",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Hover over any segment to explore. Click to jump in.
        </p>
      </div>

      {/* Pie */}
      <div className="pie-wrap">
        <div className="pie">
          {QUADRANTS.map((s, i) => {
            const qi = i as 0 | 1 | 2 | 3;
            const cssVars = {
              ["--seg-accent" as string]: s.accent,
              ["--seg-tint" as string]: s.shadowTint,
            } as React.CSSProperties;
            return (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={`seg-card seg-q${qi}`}
                style={{ ...cssVars, borderRadius: CORNERS[qi] }}
                aria-label={`Visit ${s.name}`}
              >
                <div className="seg-logo-wrap">
                  {s.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logo}
                      alt={s.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: s.logoScale ? `scale(${s.logoScale})` : undefined,
                      }}
                    />
                  ) : (
                    <span
                      className="seg-monogram"
                      style={{ color: s.accent, textShadow: `0 0 24px ${s.accent}` }}
                    >
                      {s.monogram ?? s.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <Tooltip s={s} />
              </a>
            );
          })}

          {/* Central Hub */}
          <a
            href={HUB.url}
            target="_blank"
            rel="noreferrer"
            className="pie-hub"
            style={{
              ["--seg-accent" as string]: HUB.accent,
              ["--seg-tint" as string]: HUB.shadowTint,
            } as React.CSSProperties}
            aria-label="Visit Cryptomadness"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HUB.logo!} alt={HUB.name} />
            <Tooltip s={HUB} />
          </a>
        </div>
      </div>
    </div>
  );
}

function Tooltip({ s }: { s: Segment }) {
  return (
    <div className="seg-tooltip">
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "var(--text)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {s.name}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: s.accent,
            boxShadow: `0 0 10px ${s.accent}`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          fontWeight: 700,
          marginTop: 4,
          marginBottom: 10,
        }}
      >
        {s.tagline}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 12px" }}>
        {s.description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {s.features.map((f) => (
          <span
            key={f}
            style={{
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 999,
              background: `${s.accent}15`,
              border: `1px solid ${s.accent}40`,
              color: "var(--text)",
              fontWeight: 600,
              letterSpacing: 0.3,
            }}
          >
            {f}
          </span>
        ))}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10,
          letterSpacing: 2,
          color: s.accent,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        Visit Platform
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </div>
  );
}
