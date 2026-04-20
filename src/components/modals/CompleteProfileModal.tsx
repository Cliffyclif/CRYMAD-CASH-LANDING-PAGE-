"use client";

import { useState } from "react";
import { useUser } from "@/components/providers/UserProvider";

const COUNTRIES = [
  { name: "United States", iso: "US" }, { name: "United Kingdom", iso: "GB" },
  { name: "Canada", iso: "CA" }, { name: "Australia", iso: "AU" },
  { name: "Germany", iso: "DE" }, { name: "France", iso: "FR" },
  { name: "Nigeria", iso: "NG" }, { name: "South Africa", iso: "ZA" },
  { name: "India", iso: "IN" }, { name: "Brazil", iso: "BR" },
  { name: "Japan", iso: "JP" }, { name: "Singapore", iso: "SG" },
  { name: "UAE", iso: "AE" }, { name: "Netherlands", iso: "NL" },
  { name: "Switzerland", iso: "CH" }, { name: "Ireland", iso: "IE" },
  { name: "Kenya", iso: "KE" }, { name: "Ghana", iso: "GH" },
];
const LANGUAGES = [
  { name: "English", code: "en" }, { name: "French", code: "fr" },
  { name: "Spanish", code: "es" }, { name: "German", code: "de" },
  { name: "Portuguese", code: "pt" }, { name: "Arabic", code: "ar" },
  { name: "Chinese", code: "zh" }, { name: "Japanese", code: "ja" },
  { name: "Hindi", code: "hi" }, { name: "Yoruba", code: "yo" },
  { name: "Igbo", code: "ig" }, { name: "Hausa", code: "ha" },
];
const COUNTRY_CODES = [
  { code: "+1", label: "US +1" }, { code: "+44", label: "UK +44" },
  { code: "+234", label: "NG +234" }, { code: "+27", label: "ZA +27" },
  { code: "+91", label: "IN +91" }, { code: "+61", label: "AU +61" },
  { code: "+49", label: "DE +49" }, { code: "+33", label: "FR +33" },
  { code: "+81", label: "JP +81" }, { code: "+971", label: "AE +971" },
];

export function CompleteProfileModal() {
  const { user, refresh } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Email verification gate: if TygaBank hasn't flipped emailIsVerified,
  // we block profile save and collect the verification code first.
  const [emailVerifiedLocal, setEmailVerifiedLocal] = useState<boolean>(!!user?.emailVerified);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [firstName, setFirstName] = useState(() => {
    const f = user?.firstName;
    // "Pending" and email-local placeholders shouldn't pre-fill.
    if (!f || f === "Pending" || f === user?.email?.split("@")[0]) return "";
    return f;
  });
  const [lastName, setLastName] = useState(() => {
    const l = user?.lastName;
    if (!l || l === "Pending") return "";
    return l;
  });
  const [dob, setDob] = useState(user?.dateOfBirth ?? "");
  const [phoneCode, setPhoneCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");

  async function resendCode() {
    if (resendCooldown > 0) return;
    setVerifyInfo("");
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      const j = await res.json();
      if (j.tygaSent) {
        setVerifyInfo("A new code was sent. Check your inbox and spam folder.");
      } else if (j.tygaError?.body?.details === "email_verification_timeout") {
        setVerifyInfo("A code was already sent recently — check your inbox. You can resend again in a few minutes.");
      } else {
        setVerifyInfo("Resend attempted. Check your inbox.");
      }
      setResendCooldown(60);
      const tick = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) { clearInterval(tick); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch {
      setError("Couldn't resend code. Try again shortly.");
    }
  }

  async function verifyEmail() {
    setError("");
    if (verifyCode.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, code: verifyCode, purpose: "register" }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error === "invalid_code" ? "Invalid or expired code." : "Verification failed. Try again.");
        return;
      }
      setEmailVerifiedLocal(true);
      setVerifyInfo("Email verified. Continue with your profile.");
      await refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function submit() {
    setError("");
    if (!firstName || !lastName || !dob || !phone || !street || !city || !state || !zip || !country) {
      setError("Please fill in all required fields across all steps.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/complete-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, dateOfBirth: dob,
          phoneNumber: `${phoneCode}${phone}`,
          languageCode: language,
          address: { addressLine1: street, city, subdivision: state, postalCode: zip, country },
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error === "tygabank_error" ? "Could not save your profile. Please try again." : "Failed to save. Try again.");
        return;
      }
      await refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    background: "var(--surface)", border: "1px solid var(--glass-border)",
    color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5,
    color: "var(--text-muted)", marginBottom: 6, display: "block",
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle, appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--glass-border)", borderRadius: 24,
          width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
          padding: "36px 32px", position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div
            style={{
              display: "inline-block", padding: "6px 14px", borderRadius: 20,
              background: "rgba(var(--primary-rgb), 0.15)", color: "var(--primary)",
              fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Required
          </div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 4, textAlign: "center" }}>
          {emailVerifiedLocal ? "Complete Your Profile" : "Verify Your Email"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, textAlign: "center" }}>
          {emailVerifiedLocal
            ? <>We need a few details before you can use your wallet. Step {step} of 3.</>
            : <>We sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to continue.</>}
        </p>

        {emailVerifiedLocal && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                border: s === step ? "2px solid var(--primary)" : s < step ? "2px solid var(--primary)" : "2px solid var(--glass-border)",
                background: s < step ? "var(--primary)" : s === step ? "rgba(var(--primary-rgb), 0.15)" : "transparent",
                color: s < step ? "var(--bg)" : s === step ? "var(--primary)" : "var(--text-muted)",
                transition: "all 0.3s",
              }}
            >
              {s < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              ) : s}
            </div>
          ))}
        </div>
        )}

        {!emailVerifiedLocal && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <input
              inputMode="numeric" pattern="\d{6}" maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
              style={{
                ...inputStyle, letterSpacing: 8, textAlign: "center",
                fontFamily: "JetBrains Mono, monospace", fontSize: 22, marginBottom: 12,
              }}
            />
            {verifyInfo && (
              <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", marginBottom: 12 }}>
                {verifyInfo}
              </div>
            )}
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
              Didn&apos;t receive it?{" "}
              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <button type="button" onClick={resendCode}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                  Resend code
                </button>
              )}
            </div>
          </div>
        )}

        {emailVerifiedLocal && step === 1 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>First Name</label>
                <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Last Name</label>
                <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
          </div>
        )}

        {emailVerifiedLocal && step === 2 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} style={{ ...selectStyle, width: 110, flex: "none" }}>
                  {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code} style={{ background: "var(--bg)" }}>{c.label}</option>)}
                </select>
                <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Street Address</label>
              <input type="text" placeholder="123 Main Street" value={street} onChange={(e) => setStreet(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>City</label>
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>State</label>
                <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Zip Code</label>
                <input type="text" placeholder="10001" value={zip} onChange={(e) => setZip(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} style={selectStyle}>
                  <option value="" style={{ background: "var(--bg)" }}>Select</option>
                  {COUNTRIES.map((c) => <option key={c.iso} value={c.iso} style={{ background: "var(--bg)" }}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {emailVerifiedLocal && step === 3 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Preferred Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code} style={{ background: "var(--bg)" }}>{l.name}</option>)}
              </select>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--glass-border)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--primary)", marginBottom: 12 }}>Summary</div>
              {[
                { label: "Name", value: `${firstName} ${lastName}`.trim() || "—" },
                { label: "Date of Birth", value: dob || "—" },
                { label: "Phone", value: phone ? `${phoneCode} ${phone}` : "—" },
                { label: "Address", value: [street, city, state, zip].filter(Boolean).join(", ") || "—" },
                { label: "Country", value: COUNTRIES.find((c) => c.iso === country)?.name || "—" },
                { label: "Language", value: LANGUAGES.find((l) => l.code === language)?.name || language },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 5 ? "1px solid var(--glass-border)" : "none" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            color: "var(--danger)", fontSize: 13, marginBottom: 12,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
          }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {emailVerifiedLocal && step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} disabled={loading}
              style={{
                flex: 1, padding: 13, borderRadius: 12,
                background: "var(--surface)", color: "var(--text)",
                fontWeight: 600, fontSize: 14, border: "1px solid var(--glass-border)",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", opacity: loading ? 0.6 : 1,
              }}>Back</button>
          )}
          <button type="button" disabled={loading || verifyLoading}
            onClick={() => {
              if (!emailVerifiedLocal) { verifyEmail(); return; }
              if (step < 3) setStep((s) => s + 1); else submit();
            }}
            style={{
              flex: 1, padding: 13, borderRadius: 12,
              background: loading || verifyLoading ? "var(--text-muted)" : "var(--primary)",
              color: "var(--bg)", fontWeight: 700, fontSize: 14, border: "none",
              cursor: (loading || verifyLoading) ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif",
            }}>
            {!emailVerifiedLocal
              ? (verifyLoading ? "Verifying…" : "Verify Email")
              : loading ? "Saving…" : step === 3 ? "Complete Profile" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
