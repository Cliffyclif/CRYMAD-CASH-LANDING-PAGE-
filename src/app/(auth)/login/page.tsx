"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";

type Mode = "password" | "otp";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();
  const nextUrl = params?.get("next") || "/dashboard";

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

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
    transition: "border-color 0.3s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5,
    color: "var(--text-muted)", marginBottom: 6, display: "block",
  };

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("app.auth.login.fillAllFields")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error === "invalid_credentials" ? t("app.auth.login.invalidCredentials") : t("app.auth.login.loginFailed"));
        return;
      }
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError(t("app.auth.login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function sendCode() {
    setError("");
    if (!email) { setError(t("app.auth.login.enterEmailFirst")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "login" }),
      });
      const j = await res.json();
      if (!res.ok) { setError(t("app.auth.login.couldNotSendCode")); return; }
      setCodeSent(true);
      if (j.devCode) setDevCode(j.devCode);
    } catch {
      setError(t("app.auth.login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !code || code.length !== 6) { setError(t("app.auth.login.enterSixDigit")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose: "login" }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error === "invalid_code" ? t("app.auth.login.codeInvalid") : t("app.auth.login.verifyFailed"));
        return;
      }
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError(t("app.auth.login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{t("app.auth.login.title")}</h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 22 }}>{t("app.auth.login.subtitle")}</p>

      {/* Mode Toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, background: "var(--surface)", borderRadius: 12, marginBottom: 22 }}>
        {(["password", "otp"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(""); setCodeSent(false); setCode(""); setDevCode(null); }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: mode === m ? "var(--primary)" : "transparent",
              color: mode === m ? "var(--bg)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}
          >
            {m === "password" ? t("app.auth.login.tabPassword") : t("app.auth.login.tabEmailCode")}
          </button>
        ))}
      </div>

      {mode === "password" && (
        <form onSubmit={submitPassword}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{t("app.common.emailAddress")}</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" required />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>{t("app.auth.login.passwordLabel")}</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder={t("app.auth.login.passwordPlaceholder")}
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <Link href="/forgot-password" style={{ color: "var(--primary)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>{t("app.auth.login.forgotPassword")}</Link>
          </div>

          {error && <ErrorBox text={error} />}

          <PrimaryBtn loading={loading} label={t("app.auth.login.signInCta")} loadingLabel={t("app.common.loading")} />
        </form>
      )}

      {mode === "otp" && (
        <form onSubmit={codeSent ? submitOtp : (e) => { e.preventDefault(); sendCode(); }}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{t("app.common.emailAddress")}</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email"
              disabled={codeSent} required />
          </div>

          {codeSent && (
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>{t("app.auth.login.enterCode")}</label>
              <input
                inputMode="numeric" pattern="\d{6}" maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: 18 }}
                autoFocus required />
              {devCode && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  Dev mode: <code style={{ fontFamily: "JetBrains Mono, monospace" }}>{devCode}</code>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setCodeSent(false); setCode(""); setDevCode(null); }}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer", padding: 0, marginTop: 8 }}>
                {t("app.auth.login.useDifferentEmail")}
              </button>
            </div>
          )}

          {error && <ErrorBox text={error} />}

          <PrimaryBtn loading={loading} label={codeSent ? t("app.auth.login.verifyCode") : t("app.auth.login.sendCode")} loadingLabel={t("app.common.loading")} />
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
        {t("app.auth.login.newHere")}{" "}
        <Link href="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
          {t("app.auth.login.createAccount")}
        </Link>
      </div>
    </div>
  );
}

function PrimaryBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading}
      style={{
        width: "100%", padding: 14, borderRadius: 12,
        background: loading ? "var(--text-muted)" : "var(--primary)",
        color: "var(--bg)", fontWeight: 700, fontSize: 14, border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.2s", fontFamily: "Inter, sans-serif",
      }}>
      {loading && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "orbitSpin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" stroke="var(--bg)" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
        </svg>
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div style={{
      color: "var(--danger)", fontSize: 13, marginBottom: 16,
      padding: "10px 14px", borderRadius: 10,
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
    }}>{text}</div>
  );
}
