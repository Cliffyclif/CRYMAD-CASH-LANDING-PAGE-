"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getPasswordStrength(pw: string): { label: string; color: string; percent: number } {
  if (!pw) return { label: "", color: "transparent", percent: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "var(--danger)", percent: 25 };
  if (score <= 3) return { label: "Medium", color: "var(--warning)", percent: 55 };
  return { label: "Strong", color: "var(--success)", percent: 100 };
}

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }
    if (accountType === "business" && (!companyName || !businessType)) {
      setError("Please fill in all business fields.");
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
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          accountType: accountType === "personal" ? "individual" : "business",
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(
          j.error === "Email already registered"
            ? "This email is already registered. Try signing in instead."
            : j.error === "tygabank_error"
              ? "Could not create your account. Please try again later."
              : "Registration failed. Try again."
        );
        return;
      }
      // Redirect to email verification, passing email + dev code (if present)
      const url = `/register/verify-email?email=${encodeURIComponent(email)}${j.devCode ? `&devCode=${j.devCode}` : ""}`;
      router.push(url);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
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
    transition: "border-color 0.3s",
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

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
        Create Account
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
        Join our digital finance platform
      </p>

      {/* Account Type Toggle */}
      <div
        style={{
          display: "flex",
          background: "var(--surface)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          border: "1px solid var(--glass-border)",
        }}
      >
        {(["personal", "business"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setAccountType(type)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              transition: "all 0.3s",
              background: accountType === type ? "var(--primary)" : "transparent",
              color: accountType === type ? "var(--bg)" : "var(--text-secondary)",
            }}
          >
            {type === "personal" ? "Personal" : "Business"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input type="text" placeholder="First name" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} style={inputStyle} autoComplete="given-name" />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input type="text" placeholder="Last name" value={lastName}
              onChange={(e) => setLastName(e.target.value)} style={inputStyle} autoComplete="family-name" />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 4 }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Strength Indicator */}
        {password && (
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "var(--surface)",
                marginTop: 8,
                marginBottom: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${strength.percent}%`,
                  background: strength.color,
                  borderRadius: 2,
                  transition: "width 0.3s, background 0.3s",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: strength.color, fontWeight: 500 }}>
              {strength.label}
            </span>
          </div>
        )}
        {!password && <div style={{ marginBottom: 18 }} />}

        {/* Confirm Password */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Business Fields */}
        {accountType === "business" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Company Name</label>
              <input
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Registration Number</label>
              <input
                type="text"
                placeholder="Company registration number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                <option value="" style={{ background: "var(--bg)" }}>Select business type</option>
                <option value="sole" style={{ background: "var(--bg)" }}>Sole Proprietorship</option>
                <option value="llc" style={{ background: "var(--bg)" }}>LLC</option>
                <option value="corp" style={{ background: "var(--bg)" }}>Corporation</option>
                <option value="partnership" style={{ background: "var(--bg)" }}>Partnership</option>
                <option value="nonprofit" style={{ background: "var(--bg)" }}>Non-Profit</option>
              </select>
            </div>
          </div>
        )}

        {/* Checkboxes */}
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ marginTop: 2, accentColor: "var(--primary)" }}
            />
            <span>
              I agree to the{" "}
              <Link href="#" style={{ color: "var(--primary)", textDecoration: "none" }}>
                Terms of Service
              </Link>
            </span>
          </label>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              style={{ marginTop: 2, accentColor: "var(--primary)" }}
            />
            <span>
              I agree to the{" "}
              <Link href="#" style={{ color: "var(--primary)", textDecoration: "none" }}>
                Privacy Policy
              </Link>
            </span>
          </label>
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

        {/* Submit */}
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
            transition: "background 0.3s",
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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* Login Link */}
      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          fontSize: 14,
          color: "var(--text-secondary)",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
