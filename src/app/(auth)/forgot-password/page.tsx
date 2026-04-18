"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

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

  // Success state
  if (sent) {
    return (
      <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
        {/* Check Email Icon */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="8"
              y="16"
              width="56"
              height="40"
              rx="6"
              stroke="var(--primary)"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M8 22L36 40L64 22"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle
              cx="54"
              cy="20"
              r="10"
              fill="var(--bg)"
              stroke="var(--success)"
              strokeWidth="2"
            />
            <path
              d="M49 20L52 23L59 16"
              stroke="var(--success)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          Check Your Email
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            marginBottom: 8,
            lineHeight: 1.6,
          }}
        >
          We&apos;ve sent a password reset link to
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            color: "var(--primary)",
            marginBottom: 32,
            fontWeight: 500,
          }}
        >
          {email}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          Click the link in the email to create a new password. The link will expire in 30 minutes.
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            borderRadius: 12,
            background: "var(--primary)",
            color: "var(--bg)",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Back to Login
        </Link>
      </div>
    );
  }

  // Default state
  return (
    <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
      {/* Lock/Key Icon */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="18"
            y="32"
            width="36"
            height="28"
            rx="6"
            stroke="var(--primary)"
            strokeWidth="2.5"
            fill="rgba(var(--primary-rgb), 0.06)"
          />
          <path
            d="M24 32V24C24 17.37 29.37 12 36 12C42.63 12 48 17.37 48 24V32"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="36" cy="44" r="3" fill="var(--primary)" />
          <line
            x1="36"
            y1="47"
            x2="36"
            y2="52"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
        Reset Your Password
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginBottom: 28,
          lineHeight: 1.6,
        }}
      >
        Enter the email associated with your account and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div
            style={{
              color: "var(--danger)",
              fontSize: 13,
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

        <button
          type="submit"
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {loading && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animation: "orbitSpin 1s linear infinite" }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="var(--bg)"
                strokeWidth="3"
                strokeDasharray="32"
                strokeLinecap="round"
              />
            </svg>
          )}
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link
          href="/login"
          style={{
            color: "var(--primary)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
