"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/components/providers/UserProvider";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KYC_STYLES: Record<string, { color: string; label: string }> = {
  approved: { color: "var(--success)", label: "Verified" },
  pending: { color: "var(--warning)", label: "Pending" },
  rejected: { color: "var(--danger)", label: "Rejected" },
  not_started: { color: "var(--text-muted)", label: "Not Started" },
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, initials, fullName } = useUser();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!isOpen) return null;

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const kyc = KYC_STYLES[user?.kycStatus || "not_started"];
  const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(var(--primary-rgb), 0.08)",
    gap: 12,
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 };
  const valueStyle: React.CSSProperties = { fontSize: 13, color: "var(--text)", fontWeight: 500, textAlign: "right" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...glass, padding: 0, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 24px 20px",
          borderBottom: "1px solid var(--glass-border)",
          background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.12), transparent)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 10, border: "none", background: "rgba(var(--primary-rgb), 0.08)", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}
            aria-label="Close"
          >×</button>

          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: "var(--primary)",
            color: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 800, letterSpacing: 1,
          }}>
            {initials}
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{fullName || "Unnamed user"}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user?.email}</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              color: "var(--primary)", background: "rgba(var(--primary-rgb), 0.12)",
              textTransform: "uppercase", letterSpacing: 0.6,
            }}>
              {user?.accountType === "business" ? "Business Account" : "Individual Account"}
            </span>
            <span style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              color: kyc.color, background: `color-mix(in srgb, ${kyc.color} 15%, transparent)`,
              textTransform: "uppercase", letterSpacing: 0.6,
            }}>
              KYC {kyc.label}
            </span>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "12px 24px 20px" }}>
          <div style={row}>
            <span style={labelStyle}>Email Verified</span>
            <span style={valueStyle}>
              {user?.emailVerified ? <span style={{ color: "var(--success)" }}>Yes</span> : <span style={{ color: "var(--warning)" }}>No</span>}
            </span>
          </div>
          <div style={row}>
            <span style={labelStyle}>Registration</span>
            <span style={valueStyle}>
              {user?.completedRegistration ? <span style={{ color: "var(--success)" }}>Complete</span> : <span style={{ color: "var(--warning)" }}>Incomplete</span>}
            </span>
          </div>
          {user?.phoneNumber && (
            <div style={row}>
              <span style={labelStyle}>Phone</span>
              <span style={valueStyle}>{user.phoneNumber}</span>
            </div>
          )}
          <div style={row}>
            <span style={labelStyle}>Created</span>
            <span style={valueStyle}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
          </div>
          <div style={{ ...row, borderBottom: "none" }}>
            <span style={labelStyle}>Last Login</span>
            <span style={valueStyle}>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}</span>
          </div>

          {/* Action Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
            {!user?.completedRegistration && (
              <Link href="/register/complete" onClick={onClose}
                style={{ ...actionBtn, background: "var(--primary)", color: "var(--bg)" }}>
                Complete Profile →
              </Link>
            )}
            {user?.kycStatus !== "approved" && (
              <Link href="/register/kyc" onClick={onClose}
                style={{ ...actionBtn, background: "rgba(var(--primary-rgb), 0.1)", color: "var(--primary)", border: "1px solid rgba(var(--primary-rgb), 0.3)" }}>
                Verify Identity →
              </Link>
            )}
            <button
              onClick={logout}
              disabled={loggingOut}
              style={{ ...actionBtn, background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", cursor: loggingOut ? "not-allowed" : "pointer", opacity: loggingOut ? 0.6 : 1 }}
            >
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  padding: "12px 18px",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: 0.3,
};
