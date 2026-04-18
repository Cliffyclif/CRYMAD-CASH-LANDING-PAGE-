"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

const btnPrimary: React.CSSProperties = {
  background: "var(--primary)",
  color: "var(--bg)",
  border: "none",
  borderRadius: 12,
  padding: "12px 28px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

export default function CardSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    cardHolderFirstName: "",
    cardHolderLastName: "",
    gender: "1",          // 0=female, 1=male, 2=other
    dateOfBirth: "",
    placeOfBirth: "US",   // 2-3 char ISO country code
    occupation: "0",      // integer code (0=employed, etc.)
    phoneNumberCountryCode: "US",  // 2-letter ISO country code
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    subdivision: "",
    postalCode: "",
    country: "US",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const body = {
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        cardHolderFirstName: form.cardHolderFirstName,
        cardHolderLastName: form.cardHolderLastName,
        gender: Number(form.gender),
        dateOfBirth: form.dateOfBirth,
        placeOfBirth: form.placeOfBirth.toUpperCase().slice(0, 3),
        occupation: Number(form.occupation),
        phoneNumber: form.phoneNumber,
        phoneNumberCountryCode: form.phoneNumberCountryCode.toUpperCase().slice(0, 2),
        address: {
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          city: form.city,
          subdivision: form.subdivision,
          postalCode: form.postalCode,
          country: form.country,
        },
      };
      const r = await fetch("/api/cards/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || String(r.status));
      }
      setSuccess(true);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  if (success) {
    return (
      <div style={{ ...glass, padding: "60px 40px", textAlign: "center", maxWidth: 520, margin: "60px auto" }}>
        <svg width="64" height="64" viewBox="0 0 56 56" style={{ marginBottom: 16 }}>
          <circle cx="28" cy="28" r="28" fill="var(--success)" opacity={0.15} />
          <path d="M18 28l6 6 14-14" stroke="var(--success)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>Account Created</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 28px" }}>
          Your card account is being set up. You can now order cards once KYC is approved.
        </p>
        <Link href="/cards" style={{ ...btnPrimary, display: "inline-block", textDecoration: "none" }}>Go to Cards</Link>
      </div>
    );
  }

  const field = (k: keyof typeof form, label: string, type = "text", placeholder?: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[k]} onChange={(e) => update(k, e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );

  const select = (k: keyof typeof form, label: string, options: { value: string; label: string }[]) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={form[k]} onChange={(e) => update(k, e.target.value)} style={inputStyle}>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--bg)", color: "var(--text)" }}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const GENDERS = [
    { value: "0", label: "Female" },
    { value: "1", label: "Male" },
    { value: "2", label: "Other" },
  ];
  const OCCUPATIONS = [
    { value: "0", label: "Employed" },
    { value: "1", label: "Self-Employed" },
    { value: "2", label: "Student" },
    { value: "3", label: "Unemployed" },
    { value: "4", label: "Retired" },
    { value: "5", label: "Business Owner" },
    { value: "6", label: "Other" },
  ];
  const COUNTRIES_2 = [
    { value: "US", label: "United States (US)" },
    { value: "GB", label: "United Kingdom (GB)" },
    { value: "CA", label: "Canada (CA)" },
    { value: "AU", label: "Australia (AU)" },
    { value: "DE", label: "Germany (DE)" },
    { value: "FR", label: "France (FR)" },
    { value: "NG", label: "Nigeria (NG)" },
    { value: "ZA", label: "South Africa (ZA)" },
    { value: "IN", label: "India (IN)" },
    { value: "BR", label: "Brazil (BR)" },
    { value: "JP", label: "Japan (JP)" },
    { value: "SG", label: "Singapore (SG)" },
    { value: "AE", label: "UAE (AE)" },
    { value: "NL", label: "Netherlands (NL)" },
    { value: "CH", label: "Switzerland (CH)" },
    { value: "IE", label: "Ireland (IE)" },
    { value: "KE", label: "Kenya (KE)" },
    { value: "GH", label: "Ghana (GH)" },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 14, cursor: "pointer", marginBottom: 12 }}>← Back</button>
      <h1 style={{ color: "var(--text)", fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Set up Card Account</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>Provide the details below to create your Crymad card account.</p>

      <div style={{ ...glass, padding: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {field("firstName", "First Name")}
        {field("middleName", "Middle Name (optional)")}
        {field("lastName", "Last Name")}
        {select("gender", "Gender", GENDERS)}
        {field("cardHolderFirstName", "Cardholder First Name")}
        {field("cardHolderLastName", "Cardholder Last Name")}
        {field("dateOfBirth", "Date of Birth", "date")}
        {select("placeOfBirth", "Place of Birth", COUNTRIES_2)}
        {select("occupation", "Occupation", OCCUPATIONS)}
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
          <div>
            <label style={labelStyle}>Country</label>
            <select value={form.phoneNumberCountryCode} onChange={(e) => update("phoneNumberCountryCode", e.target.value)} style={inputStyle}>
              {COUNTRIES_2.map((c) => (
                <option key={c.value} value={c.value} style={{ background: "var(--bg)", color: "var(--text)" }}>{c.value}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
          <h3 style={{ color: "var(--text)", fontSize: 15, margin: "0 0 12px" }}>Address</h3>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>{field("addressLine1", "Street Address")}</div>
        <div style={{ gridColumn: "1 / -1" }}>{field("addressLine2", "Apt / Suite (optional)")}</div>
        {field("city", "City")}
        {field("subdivision", "State / Province")}
        {field("postalCode", "Postal Code")}
        {select("country", "Country", COUNTRIES_2)}

        {err && <div style={{ gridColumn: "1 / -1", color: "var(--danger)", fontSize: 13 }}>{err}</div>}

        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
          <Link href="/cards" style={{ ...btnPrimary, background: "transparent", color: "var(--text)", border: "1px solid var(--glass-border)", textDecoration: "none", display: "inline-block" }}>Cancel</Link>
          <button onClick={submit} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>{busy ? "Submitting…" : "Create Account"}</button>
        </div>
      </div>
    </div>
  );
}
