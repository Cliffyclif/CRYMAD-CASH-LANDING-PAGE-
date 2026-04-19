"use client";

import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { WalletCapsules } from "@/components/dashboard/WalletCapsules";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useUser } from "@/components/providers/UserProvider";
import { useLanguage } from "@/i18n/LanguageContext";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useLanguage();
  return (
    <>
      <ProfileCard />

      <WalletCapsules />

      {/* Quick Actions — 4 glass tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginTop: 8,
          marginBottom: 28,
        }}
      >
        {[
          {
            href: "/e-wallet",
            label: t("app.dashboard.quickActions.send"),
            icon: (<><polygon points="22 2 15 22 11 13 2 9 22 2" /></>),
          },
          {
            href: "/crypto",
            label: t("app.dashboard.quickActions.receive"),
            icon: (
              <>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </>
            ),
          },
          {
            href: "/crypto",
            label: t("app.dashboard.quickActions.swap"),
            icon: (
              <>
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </>
            ),
          },
          {
            href: "/orders",
            label: t("app.dashboard.quickActions.pay"),
            icon: (
              <>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </>
            ),
          },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "22px 10px",
              borderRadius: 18,
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              textDecoration: "none",
              transition: "all 0.25s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(var(--primary-rgb), 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(var(--primary-rgb), 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--glass-border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {a.icon}
            </svg>
            <span
              style={{
                color: "var(--text)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {a.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Activity + side column */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
          <ActivityFeed limit={5} />
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <WelcomeCard />
          <SecurityScoreCard />
        </aside>
      </div>
    </>
  );
}

function WelcomeCard() {
  const { t } = useLanguage();
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 18,
        padding: 22,
      }}
    >
      <h3
        style={{
          color: "var(--text)",
          fontSize: 17,
          fontWeight: 700,
          margin: "0 0 10px",
        }}
      >
        {t("app.dashboard.welcome.title")}
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 12,
          lineHeight: 1.55,
          margin: "0 0 20px",
        }}
      >
        {t("app.dashboard.welcome.body")}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "18px 0 22px",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            border: "2px solid rgba(var(--primary-rgb), 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 28px rgba(var(--primary-rgb), 0.2)",
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      </div>

      <Link
        href="/register/kyc"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid var(--primary)",
          color: "var(--primary)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          textDecoration: "none",
          background: "transparent",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {t("app.dashboard.welcome.completeSetup")}
      </Link>
    </div>
  );
}

function SecurityScoreCard() {
  const { user } = useUser();
  const { t } = useLanguage();
  // Derived from observable security signals: email verified, KYC, registration,
  // account presence. 2FA/hardware keys can add more when wired.
  let score = 0;
  if (user) score += 15;
  if (user?.emailVerified) score += 25;
  if (user?.completedRegistration) score += 25;
  if (user?.kycStatus === "approved") score += 35;
  else if (user?.kycStatus === "pending") score += 10;
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 18,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("app.dashboard.securityScore.label")}
        </div>
        <div
          style={{
            color: "var(--primary)",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1,
          }}
        >
          {score}
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: 13,
              fontWeight: 500,
              marginLeft: 2,
            }}
          >
            {t("app.dashboard.securityScore.outOf")}
          </span>
        </div>
      </div>

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1.5px solid rgba(var(--primary-rgb), 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(var(--primary-rgb), 0.08)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      </div>
    </div>
  );
}
