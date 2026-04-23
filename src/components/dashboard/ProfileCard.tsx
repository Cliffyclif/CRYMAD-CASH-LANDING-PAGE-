"use client";

import { useUser } from "@/components/providers/UserProvider";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRouter } from "next/navigation";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function ProfileCard() {
  const { user, initials, fullName, loading } = useUser();
  const { t } = useLanguage();
  const router = useRouter();

  if (loading) {
    return (
      <div className="profile-card">
        <div className="profile-left">
          <div className="profile-avatar-ring"><div className="profile-avatar">…</div></div>
          <div className="profile-info">
            <h3 style={{ opacity: 0.5 }}>{t("app.common.loading")}</h3>
            <p style={{ opacity: 0.5 }}>&nbsp;</p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const d = user.createdAt ? new Date(user.createdAt) : null;
  const joined = d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "";
  const kycLabel = {
    not_started: t("app.dashboard.profile.kycNotStarted"),
    pending: t("app.dashboard.profile.kycPending"),
    approved: t("app.dashboard.profile.kycVerified"),
    rejected: t("app.dashboard.profile.kycNotStarted"),
  }[user.kycStatus];

  const accountTypeLabel = user.accountType === "business"
    ? t("app.dashboard.profile.businessAccount").toUpperCase()
    : t("app.dashboard.profile.personalAccount").toUpperCase();

  return (
    <div className="profile-card">
      <div className="profile-left">
        <div className="profile-avatar-ring">
          <div className="profile-avatar">{initials}</div>
        </div>
        <div className="profile-info">
          <h3>{fullName || user.email}</h3>
          <p>
            {user.email}
            {joined ? ` · ${joined}` : ""}
          </p>
        </div>
      </div>
      <div className="profile-right">
        <div className="profile-badge">{accountTypeLabel}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            className="kyc-dot"
            style={{
              background:
                user.kycStatus === "approved"
                  ? "var(--success, #10b981)"
                  : user.kycStatus === "pending"
                    ? "var(--warning, #f59e0b)"
                    : user.kycStatus === "rejected"
                      ? "var(--danger, #ef4444)"
                      : "var(--text-muted)",
            }}
          />
          {user.kycStatus === "approved" ? (
            <span className="kyc-label">{kycLabel}</span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/register/kyc");
              }}
              style={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(var(--primary-rgb), 0.4)",
                background: "rgba(var(--primary-rgb), 0.08)",
                color: "var(--primary)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.18)";
                e.currentTarget.style.borderColor = "rgba(var(--primary-rgb), 0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.08)";
                e.currentTarget.style.borderColor = "rgba(var(--primary-rgb), 0.4)";
              }}
            >
              {kycLabel}
              {user.kycStatus !== "pending" ? " — Start" : ""}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
