"use client";

import { useUser } from "@/components/providers/UserProvider";
import { useLanguage } from "@/i18n/LanguageContext";
import Link from "next/link";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function ProfileCard() {
  const { user, initials, fullName, loading } = useUser();
  const { t } = useLanguage();

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
            <Link
              href="/register/kyc"
              className="kyc-label"
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              {kycLabel}
              {user.kycStatus !== "pending" ? " — Start" : ""}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
