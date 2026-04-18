"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Verify2FAPage() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last char
    setCode(newCode);
    setError("");

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newCode = [...code];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setError("Invalid code. Please try again.");
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(30);
    setCanResend(false);
    setCode(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  const boxStyle: React.CSSProperties = {
    width: 48,
    height: 56,
    textAlign: "center",
    fontSize: 24,
    fontWeight: 700,
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--glass-border)",
    color: "var(--text)",
    outline: "none",
    fontFamily: "var(--font-mono)",
    transition: "border-color 0.3s, box-shadow 0.3s",
    caretColor: "var(--primary)",
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
      {/* Shield Icon */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M28 6L8 16V26C8 38.36 16.28 49.54 28 54C39.72 49.54 48 38.36 48 26V16L28 6Z"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="rgba(var(--primary-rgb), 0.06)"
          />
          <rect
            x="19"
            y="22"
            width="18"
            height="14"
            rx="3"
            stroke="var(--primary)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M22 22V18C22 14.69 24.69 12 28 12C31.31 12 34 14.69 34 18V22"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="28" cy="29" r="2" fill="var(--primary)" />
        </svg>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
        Two-Factor Authentication
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.5 }}>
        Enter the 6-digit code from your authenticator app
      </p>

      {/* Code Inputs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 24,
        }}
        onPaste={handlePaste}
      >
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            style={{
              ...boxStyle,
              borderColor: digit ? "rgba(var(--primary-rgb), 0.4)" : "var(--glass-border)",
              boxShadow: digit ? "0 0 12px rgba(var(--primary-rgb), 0.15)" : "none",
            }}
          />
        ))}
      </div>

      {/* Error */}
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

      {/* Verify Button */}
      <button
        onClick={handleVerify}
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
          marginBottom: 20,
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
        {loading ? "Verifying..." : "Verify"}
      </button>

      {/* Resend Code */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={handleResend}
          disabled={!canResend}
          style={{
            background: "none",
            border: "none",
            color: canResend ? "var(--primary)" : "var(--text-muted)",
            fontSize: 13,
            fontWeight: 500,
            cursor: canResend ? "pointer" : "default",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {canResend ? "Resend Code" : `Resend in ${countdown}s`}
        </button>
      </div>

      {/* Back to Login */}
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
  );
}
