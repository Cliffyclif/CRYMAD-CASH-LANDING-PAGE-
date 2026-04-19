"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--glass-border)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "var(--text-muted)",
    marginBottom: 6,
    display: "block",
  };

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError(t("app.auth.login.enterEmailFirst")); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      if (!r.ok) { setError(t("app.auth.login.couldNotSendCode")); return; }
      // Always proceed to step 2 — the API silently no-ops for unknown emails
      // so attackers can't enumerate accounts.
      setStep("reset");
    } catch {
      setError(t("app.auth.login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code || code.length !== 6) { setError(t("app.auth.login.enterSixDigit")); return; }
    if (!newPassword || newPassword.length < 8) { setError(t("app.auth.register.passwordTooShort")); return; }
    if (newPassword !== confirmPassword) { setError(t("app.auth.register.passwordsDontMatch")); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error === "invalid_or_expired" ? t("app.auth.login.codeInvalid") : t("app.auth.login.verifyFailed"));
        return;
      }
      setStep("done");
    } catch {
      setError(t("app.auth.login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    background: loading ? "var(--text-muted)" : "var(--primary)",
    color: "var(--bg)",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  // ── Success state ──────────────────────────────────────
  if (step === "done") {
    return (
      <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          Password Reset
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
          Your password has been updated. You can now sign in with your new password.
        </p>
        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "14px 32px",
            borderRadius: 12,
            background: "var(--primary)",
            color: "var(--bg)",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t("app.auth.login.signInCta")}
        </button>
      </div>
    );
  }

  // ── Step 2: enter code + new password ─────────────────
  if (step === "reset") {
    return (
      <div style={{ animation: "fadeIn 0.5s ease" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 6, textAlign: "center" }}>
          Enter Reset Code
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 22, textAlign: "center", lineHeight: 1.55 }}>
          If an account exists for <span style={{ color: "var(--primary)", fontWeight: 600 }}>{email}</span>, we sent a 6-digit code. It expires in 10 minutes.
        </p>

        <form onSubmit={submitReset}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{t("app.auth.login.enterCode")}</label>
            <input
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: 18 }}
              autoFocus
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{t("app.auth.register.confirmPasswordLabel")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              style={inputStyle}
              required
            />
          </div>

          {error && (
            <div style={{
              color: "var(--danger)", fontSize: 13, marginBottom: 16,
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? t("app.common.loading") : "Reset Password"}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: "center", display: "flex", gap: 16, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => { setStep("email"); setCode(""); setNewPassword(""); setConfirmPassword(""); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer", padding: 0 }}
          >
            {t("app.auth.login.useDifferentEmail")}
          </button>
          <Link href="/login" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
            {t("app.auth.forgot.backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Step 1: enter email ───────────────────────────────
  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "rgba(var(--primary-rgb), 0.08)",
          border: "1px solid rgba(var(--primary-rgb), 0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 6, textAlign: "center" }}>
        {t("app.auth.forgot.title")}
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 26, textAlign: "center", lineHeight: 1.55 }}>
        {t("app.auth.forgot.subtitle")}
      </p>

      <form onSubmit={sendCode}>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>{t("app.common.emailAddress")}</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
            autoComplete="email"
          />
        </div>

        {error && (
          <div style={{
            color: "var(--danger)", fontSize: 13, marginBottom: 16,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
          }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={primaryBtn}>
          {loading ? t("app.common.sending") : t("app.auth.forgot.sendReset")}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Link href="/login" style={{ color: "var(--primary)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
          {t("app.auth.forgot.backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
