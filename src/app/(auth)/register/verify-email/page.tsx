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

  const [email, setEmail] = useState(qEmail);
  const [checking, setChecking] = useState(false);
  const [resendIn, setResendIn] = useState(60);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function checkVerified() {
    setError("");
    setInfo("");
    setChecking(true);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) {
        router.push(`/login?email=${encodeURIComponent(email)}`);
        return;
      }
      const j = await res.json();
      if (j.user?.emailVerified) {
        router.push("/dashboard");
        return;
      }
      setInfo("Not verified yet. Open the email and click the verification link, then try again.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setChecking(false);
    }
  }

  async function resend() {
    if (resendIn > 0 || !email) return;
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (j.tygaSent) setInfo("New verification email sent. Check your inbox.");
      else if (j.tygaError?.body?.details === "email_verification_timeout") setInfo("A verification email was already sent recently. Check your inbox and spam folder.");
      else setInfo("Resend attempted. Check your inbox.");
      setResendIn(60);
    } catch {
      setError("Couldn't resend. Try again shortly.");
    }
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
        We sent a verification link to
        {email ? <><br /><code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--primary)" }}>{email}</code></> : " your email"}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
        Open the email from <strong>Crymad Cash</strong>, click the <strong>verification link</strong> inside,
        then return here and tap the button below.
      </p>

      {!qEmail && (
        <div style={{ marginBottom: 14, textAlign: "left" }}>
          <input type="email" placeholder="Enter your email" value={email}
            onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
        </div>
      )}

      {info && (
        <div style={{
          color: "var(--primary)", fontSize: 12, marginBottom: 14, lineHeight: 1.5,
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(var(--primary-rgb), 0.08)",
          border: "1px solid rgba(var(--primary-rgb), 0.2)",
        }}>{info}</div>
      )}

      {error && (
        <div style={{
          color: "var(--danger)", fontSize: 13, marginBottom: 14,
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}>{error}</div>
      )}

      <button type="button" onClick={checkVerified} disabled={checking}
        style={{
          width: "100%", padding: 14, borderRadius: 12,
          background: checking ? "var(--text-muted)" : "var(--primary)",
          color: "var(--bg)", fontWeight: 700, fontSize: 14, border: "none",
          cursor: checking ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif", marginBottom: 10,
        }}>
        {checking ? "Checking..." : "I've verified my email"}
      </button>

      <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-secondary)" }}>
        Didn&apos;t receive it?{" "}
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
