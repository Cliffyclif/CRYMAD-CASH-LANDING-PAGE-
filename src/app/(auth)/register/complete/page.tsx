"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const COUNTRIES: { name: string; iso: string }[] = [
  { name: "United States", iso: "US" },
  { name: "United Kingdom", iso: "GB" },
  { name: "Canada", iso: "CA" },
  { name: "Australia", iso: "AU" },
  { name: "Germany", iso: "DE" },
  { name: "France", iso: "FR" },
  { name: "Nigeria", iso: "NG" },
  { name: "South Africa", iso: "ZA" },
  { name: "India", iso: "IN" },
  { name: "Brazil", iso: "BR" },
  { name: "Japan", iso: "JP" },
  { name: "Singapore", iso: "SG" },
  { name: "UAE", iso: "AE" },
  { name: "Netherlands", iso: "NL" },
  { name: "Switzerland", iso: "CH" },
  { name: "Ireland", iso: "IE" },
  { name: "Kenya", iso: "KE" },
  { name: "Ghana", iso: "GH" },
];

const LANGUAGES: { name: string; code: string }[] = [
  { name: "English", code: "en" },
  { name: "French", code: "fr" },
  { name: "Spanish", code: "es" },
  { name: "German", code: "de" },
  { name: "Portuguese", code: "pt" },
  { name: "Arabic", code: "ar" },
  { name: "Chinese", code: "zh" },
  { name: "Japanese", code: "ja" },
  { name: "Hindi", code: "hi" },
  { name: "Yoruba", code: "yo" },
  { name: "Igbo", code: "ig" },
  { name: "Hausa", code: "ha" },
];

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+234", label: "NG +234" },
  { code: "+27", label: "ZA +27" },
  { code: "+91", label: "IN +91" },
  { code: "+61", label: "AU +61" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+81", label: "JP +81" },
  { code: "+971", label: "AE +971" },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");

  // Step 2
  const [phoneCode, setPhoneCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState(""); // holds ISO code

  // Step 3
  const [language, setLanguage] = useState("en");

  async function submitComplete() {
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
          firstName,
          lastName,
          dateOfBirth: dob,
          phoneNumber: `${phoneCode}${phone}`,
          languageCode: language,
          address: {
            addressLine1: street,
            city,
            subdivision: state,
            postalCode: zip,
            country,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(
          j.error === "tygabank_error"
            ? "Could not save your profile. Please try again."
            : "Failed to save. Try again."
        );
        return;
      }
      router.push("/register/kyc");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

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

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
        Complete Profile
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
        Step {step} of 3
      </p>

      {/* Step Dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              border: s === step ? "2px solid var(--primary)" : s < step ? "2px solid var(--primary)" : "2px solid var(--glass-border)",
              background: s < step ? "var(--primary)" : s === step ? "rgba(var(--primary-rgb), 0.15)" : "transparent",
              color: s < step ? "var(--bg)" : s === step ? "var(--primary)" : "var(--text-muted)",
              transition: "all 0.3s",
            }}
          >
            {s < step ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              s
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>
        </div>
      )}

      {/* Step 2: Address */}
      {step === 2 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Phone Number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                style={{ ...selectStyle, width: 110, flex: "none" }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: "var(--bg)" }}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Street Address</label>
            <input
              type="text"
              placeholder="123 Main Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>State</label>
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Zip Code</label>
              <input
                type="text"
                placeholder="10001"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={selectStyle}
              >
                <option value="" style={{ background: "var(--bg)" }}>Select</option>
                {COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso} style={{ background: "var(--bg)" }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preferences + Summary */}
      {step === 3 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Preferred Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={selectStyle}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "var(--bg)" }}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Summary */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "var(--primary)",
                marginBottom: 16,
              }}
            >
              Profile Summary
            </div>
            {[
              { label: "Name", value: `${firstName} ${lastName}`.trim() || "Not set" },
              { label: "Date of Birth", value: dob || "Not set" },
              { label: "Phone", value: phone ? `${phoneCode} ${phone}` : "Not set" },
              { label: "Address", value: [street, city, state, zip].filter(Boolean).join(", ") || "Not set" },
              { label: "Country", value: COUNTRIES.find((c) => c.iso === country)?.name || "Not set" },
              { label: "Language", value: LANGUAGES.find((l) => l.code === language)?.name || language },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < 5 ? "1px solid var(--glass-border)" : "none",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.label}</span>
                <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
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

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={loading}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              background: "var(--surface)",
              color: "var(--text)",
              fontWeight: 600,
              fontSize: 14,
              border: "1px solid var(--glass-border)",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            if (step < 3) {
              setStep((s) => s + 1);
            } else {
              submitComplete();
            }
          }}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            background: loading ? "var(--text-muted)" : "var(--primary)",
            color: "var(--bg)",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {loading ? "Saving..." : step === 3 ? "Complete Profile" : "Continue"}
        </button>
      </div>

      {/* Skip Link */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link
          href="/dashboard"
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}
