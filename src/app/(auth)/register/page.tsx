"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";

function getStrengthScore(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 1;
  if (score <= 3) return 2;
  return 3;
}

function strengthLabel(score: 0 | 1 | 2 | 3): string {
  return ["", "Weak", "Medium", "Strong"][score];
}

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [corpId, setCorpId] = useState("");
  const [taxRef, setTaxRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const score = getStrengthScore(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError(t("app.auth.register.fillRequired"));
      return;
    }
    if (password.length < 8) {
      setError(t("app.auth.register.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("app.auth.register.passwordsDontMatch"));
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError(t("app.auth.register.agreeRequired"));
      return;
    }
    if (accountType === "business" && !corpId) {
      setError(t("app.auth.register.corpIdRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          accountType: accountType === "personal" ? "individual" : "business",
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(
          j.error === "Email already registered"
            ? t("app.auth.register.emailTaken")
            : j.error === "tygabank_error"
              ? t("app.auth.register.cantCreate")
              : t("app.auth.register.registerFailed")
        );
        return;
      }
      const url = `/register/verify-email?email=${encodeURIComponent(email)}${j.devCode ? `&devCode=${j.devCode}` : ""}`;
      router.push(url);
    } catch {
      setError(t("app.auth.login.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const underlineInput: React.CSSProperties = {
    width: "100%",
    padding: "10px 0 10px 2px",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--glass-border)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.25s",
    borderRadius: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "var(--primary)",
    marginBottom: 6,
    display: "block",
    opacity: 0.85,
  };

  const lockedInput: React.CSSProperties = {
    ...underlineInput,
    paddingRight: 28,
    color: accountType === "business" ? "var(--text)" : "var(--text-muted)",
    borderRadius: 10,
    border: "1px solid var(--glass-border)",
    padding: "12px 36px 12px 14px",
    background: "var(--surface)",
    opacity: accountType === "business" ? 1 : 0.6,
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Title */}
      <h1
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "var(--primary)",
          margin: "0 0 4px",
          textAlign: "center",
          letterSpacing: -0.3,
          textShadow: "0 0 30px rgba(var(--primary-rgb), 0.35)",
        }}
      >
        {t("app.auth.register.title")}
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          margin: "0 0 26px",
          textAlign: "center",
        }}
      >
        {t("app.auth.register.subtitle")}
      </p>

      {/* PERSONAL / BUSINESS tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          background: "var(--surface)",
          border: "1px solid var(--glass-border)",
          borderRadius: 999,
          padding: 4,
          marginBottom: 28,
        }}
      >
        {(["personal", "business"] as const).map((type) => {
          const disabled = false;
          return (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setAccountType(type)}
              style={{
                position: "relative",
                padding: "10px 16px",
                borderRadius: 999,
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.25s",
                background: accountType === type ? "var(--primary)" : "transparent",
                color: accountType === type ? "var(--bg)" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
                boxShadow: accountType === type ? "0 4px 20px rgba(var(--primary-rgb), 0.35)" : "none",
                opacity: disabled ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {type === "personal" ? t("app.auth.register.personal") : t("app.auth.register.business")}
              {disabled && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "rgba(var(--primary-rgb), 0.15)",
                    border: "1px solid rgba(var(--primary-rgb), 0.4)",
                    color: "var(--primary)",
                  }}
                >
                  {t("app.auth.register.soon")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>{t("app.common.emailAddress")}</label>
          <input
            type="email"
            placeholder={t("app.auth.register.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={underlineInput}
            autoComplete="email"
            required
          />
        </div>

        {/* Access Key */}
        <div style={{ marginBottom: 6 }}>
          <label style={labelStyle}>{t("app.auth.register.passwordLabel")}</label>
          <input
            type="password"
            placeholder={t("app.auth.register.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={underlineInput}
            autoComplete="new-password"
          />
        </div>
        {/* Strength segments */}
        <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 6 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: score >= i ? "var(--primary)" : "rgba(var(--primary-rgb), 0.15)",
                boxShadow: score >= i ? "0 0 8px rgba(var(--primary-rgb), 0.5)" : "none",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, minHeight: 16 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
            {password ? `${t("app.auth.register.strengthPrefix")} ${t(`app.auth.register.strength${strengthLabel(score)}`)}` : ""}
          </span>
          {score === 3 && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          )}
        </div>

        {/* Re-Entry Key */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>{t("app.auth.register.confirmPasswordLabel")}</label>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              placeholder={t("app.auth.register.passwordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ ...underlineInput, paddingRight: 30 }}
              autoComplete="new-password"
            />
            {passwordsMatch && (
              <div
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(var(--primary-rgb), 0.15)",
                  border: "1px solid var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* CORP_ID / TAX_REF grid — business only */}
        {accountType === "business" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22, animation: "fadeIn 0.3s ease" }}>
            {[
              { label: "CORP_ID", value: corpId, set: setCorpId },
              { label: "TAX_REF", value: taxRef, set: setTaxRef },
            ].map((f) => (
              <div key={f.label} style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder={f.label}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  style={lockedInput}
                />
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.8 }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Agreement pills */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {[
            { label: t("app.auth.register.termsOfService"), checked: agreeTerms, set: setAgreeTerms },
            { label: t("app.auth.register.privacyPolicy"), checked: agreePrivacy, set: setAgreePrivacy },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => opt.set(!opt.checked)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${opt.checked ? "var(--primary)" : "var(--glass-border)"}`,
                background: opt.checked ? "rgba(var(--primary-rgb), 0.08)" : "transparent",
                color: opt.checked ? "var(--primary)" : "var(--text-secondary)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: `1.5px solid ${opt.checked ? "var(--primary)" : "var(--text-muted)"}`,
                  background: opt.checked ? "var(--primary)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {opt.checked && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              color: "var(--danger)",
              fontSize: 12,
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 999,
            background: "transparent",
            color: "var(--primary)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            border: "1px solid var(--primary)",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.25s",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 0 20px rgba(var(--primary-rgb), 0.15)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.1)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(var(--primary-rgb), 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(var(--primary-rgb), 0.15)";
          }}
        >
          {loading ? t("app.auth.register.creating") : t("app.auth.register.createCta")}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </form>

      {/* Sign-in link */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {t("app.auth.register.alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700, marginLeft: 6 }}
        >
          {t("app.auth.register.signInLink")}
        </Link>
      </div>
    </div>
  );
}
