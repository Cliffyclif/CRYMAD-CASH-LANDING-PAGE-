"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const qEmail = params?.get("email") || "";
  const qDevCode = params?.get("devCode") || "";

  const [email, setEmail] = useState(qEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(60);
  const [devCode, setDevCode] = useState<string | null>(qDevCode || null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || code.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose: "register" }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error === "invalid_code" ? "Invalid or expired code." : "Verification failed.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (resendIn > 0) return;
    if (!email) return;
    try {
      const res = await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (j.devCode) setDevCode(j.devCode);
      setResendIn(60);
    } catch { /* noop */ }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    background: "var(--surface)", border: "1px solid var(--glass-border)",
    color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
      <div
        style={{
          width: 80, height: 80, margin: "0 auto 20px", borderRadius: 24,
          background: "rgba(var(--primary-rgb), 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Check Your Email</h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
        We sent a 6-digit verification code to
        {email ? <><br /><code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--primary)" }}>{email}</code></> : " your email"}
      </p>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
        Look for an email from <strong>TygaBank / Crymad Cash</strong>.<br />
        Check your spam folder if you don&apos;t see it within a minute.
      </p>

      <form onSubmit={verify}>
        {!qEmail && (
          <div style={{ marginBottom: 14, textAlign: "left" }}>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          </div>
        )}
        <input inputMode="numeric" pattern="\d{6}" maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: 22, marginBottom: 16 }}
          autoFocus required />
        {devCode && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
            Dev mode: <code style={{ fontFamily: "JetBrains Mono, monospace" }}>{devCode}</code>
          </div>
        )}

        {error && (
          <div style={{
            color: "var(--danger)", fontSize: 13, marginBottom: 14,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}>{error}</div>
        )}

        <button type="submit" disabled={loading}
          style={{
            width: "100%", padding: 14, borderRadius: 12,
            background: loading ? "var(--text-muted)" : "var(--primary)",
            color: "var(--bg)", fontWeight: 700, fontSize: 14, border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
          }}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div style={{ marginTop: 20, fontSize: 13, color: "var(--text-secondary)" }}>
        Didn&apos;t receive the code?{" "}
        {resendIn > 0 ? (
          <span>Resend in {resendIn}s</span>
        ) : (
          <button type="button" onClick={resend}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}>
            Resend
          </button>
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 13 }}>
        <Link href="/login" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Sign In</Link>
      </div>
    </div>
  );
}
