"use client";

import Link from "next/link";
import { useState } from "react";

export default function KYCPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionInfo, setSessionInfo] = useState<{ sessionUrl?: string; sessionToken?: string } | null>(null);

  async function startKyc() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/user/kyc-session", { method: "POST" });
      const j = await res.json();
      if (!res.ok) {
        const detail = j?.details?.message || j?.details?.details || j?.error;
        setError(detail ? `Could not start verification: ${detail}` : "Could not start verification. Please try again.");
        return;
      }
      const session = j.session || {};
      const url = session.sessionUrl || session.url;
      setSessionInfo({ sessionUrl: url, sessionToken: session.sessionToken || session.token });
      if (url) {
        window.location.href = url;
      } else if (session.status === "verified") {
        setError("Your identity is already verified.");
      } else {
        setError("Verification session returned no URL. Please contact support.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
      {/* Shield Icon with Pulse Ring */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {/* Pulse ring */}
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "2px solid rgba(var(--primary-rgb), 0.3)",
            animation: "pulseRing 2s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "2px solid rgba(var(--primary-rgb), 0.2)",
            animation: "pulseRing 2s ease-out infinite 0.5s",
          }}
        />
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 6L10 18V30C10 44.36 19.28 57.54 32 62C44.72 57.54 54 44.36 54 30V18L32 6Z"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="rgba(var(--primary-rgb), 0.08)"
          />
          <path
            d="M24 32L30 38L42 26"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
        Identity Verification
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginBottom: 24,
          lineHeight: 1.6,
          maxWidth: 360,
          margin: "0 auto 24px",
        }}
      >
        To comply with regulations and protect your account, we need to verify your identity. This
        is a one-time process.
      </p>

      {/* Status */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 20,
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--warning)",
            boxShadow: "0 0 8px rgba(245, 158, 11, 0.5)",
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>Not Started</span>
      </div>

      {/* Info Cards */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          {
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            ),
            title: "~5 minutes",
            desc: "Quick process",
          },
          {
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <circle cx="8" cy="15" r="1.5" fill="var(--primary)" />
              </svg>
            ),
            title: "Government ID",
            desc: "Passport or License",
          },
          {
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" />
                <path d="M22 12l-4 4-4-4" />
                <path d="M18 16V12" />
              </svg>
            ),
            title: "Up to 48 hours",
            desc: "Review time",
          },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: "var(--glass-bg)",
              backdropFilter: "blur(10px)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "16px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {card.icon}
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{card.title}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          color: "var(--danger)", fontSize: 13, marginBottom: 14,
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}>{error}</div>
      )}

      {sessionInfo?.sessionUrl && (
        <div style={{
          color: "var(--primary)", fontSize: 13, marginBottom: 14,
          padding: "12px 14px", borderRadius: 10,
          background: "rgba(var(--primary-rgb), 0.08)",
          border: "1px solid rgba(var(--primary-rgb), 0.2)",
          textAlign: "left",
        }}>
          A verification tab has opened. Complete the process there, then return here and refresh your dashboard.
          {" "}
          <a href={sessionInfo.sessionUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>Reopen tab</a>
        </div>
      )}

      {/* Start Button */}
      <button
        type="button"
        onClick={startKyc}
        disabled={loading}
        style={{
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
          marginBottom: 16,
        }}
      >
        {loading ? "Starting..." : "Start Verification"}
      </button>

      {/* Skip */}
      <Link
        href="/dashboard"
        style={{
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: 13,
        }}
      >
        Skip for Now
      </Link>
    </div>
  );
}
