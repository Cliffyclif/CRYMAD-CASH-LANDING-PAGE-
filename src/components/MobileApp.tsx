"use client";

import { AnimatedSection } from "./AnimatedSection";
import { useLanguage } from "@/i18n/LanguageContext";
import { Smartphone } from "lucide-react";

function PhoneFrame({
  variant,
  children,
}: {
  variant: "left" | "center" | "right";
  children: React.ReactNode;
}) {
  const transforms = {
    left: "perspective(1200px) rotateY(12deg) scale(0.82)",
    center: "scale(0.95)",
    right: "perspective(1200px) rotateY(-12deg) scale(0.82)",
  };
  const zIndex = variant === "center" ? 3 : 1;
  const opacity = variant === "center" ? 1 : 0.85;

  return (
    <div
      className="shrink-0"
      style={{
        width: 160,
        height: 340,
        borderRadius: 24,
        background: "#000",
        padding: 5,
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        transform: transforms[variant],
        zIndex,
        opacity,
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 19,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 72,
            height: 18,
            background: "#000",
            borderRadius: "0 0 10px 10px",
            zIndex: 20,
          }}
        />
        {children}
      </div>
    </div>
  );
}

function StatusBar({ dark }: { dark?: boolean }) {
  const color = dark ? "#fff" : "#1a1a1a";
  return (
    <div
      style={{
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        fontSize: 9,
        fontWeight: 600,
        color,
        position: "relative",
        zIndex: 10,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={9} height={9}>
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={9} height={9}>
          <rect x="17" y="4" width="4" height="16" rx="1" />
          <rect x="11" y="8" width="4" height="12" rx="1" />
          <rect x="5" y="12" width="4" height="8" rx="1" />
        </svg>
      </div>
    </div>
  );
}

function ScreenOnboarding() {
  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ padding: "2px 12px", textAlign: "right", fontSize: 9, color: "#1B8C3E", fontWeight: 600 }}>Skip</div>
      <div
        style={{
          flex: "0 0 150px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0faf3, #e8f5e9)",
          margin: "0 10px",
          borderRadius: 12,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", background: "rgba(27,140,62,0.06)" }} />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={50} height={50} stroke="#1B8C3E" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
        </svg>
      </div>
      <div style={{ flex: 1, padding: "12px 12px" }}>
        <h3 style={{ fontSize: 12, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 4 }}>Manage Your Money, Anywhere</h3>
        <p style={{ fontSize: 8, color: "#777", lineHeight: 1.4 }}>Access your e-wallet, bank accounts, and crypto — all in one place.</p>
      </div>
      <div style={{ padding: "0 12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 12, height: 4, borderRadius: 2, background: "linear-gradient(90deg, #1B8C3E, #00C853)" }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ddd" }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ddd" }} />
        </div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #1B8C3E, #00C853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={11} height={11} stroke="#fff" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ScreenBiometric() {
  return (
    <div
      style={{
        height: "100%",
        background: "linear-gradient(180deg, #0a1f12 0%, #0d2818 50%, #0f1a0f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <StatusBar dark />
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(27,140,62,0.06)" }} />
      <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", border: "1px solid rgba(27,140,62,0.1)" }} />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "rgba(27,140,62,0.1)",
          border: "2px solid rgba(27,140,62,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          boxShadow: "0 0 20px rgba(27,140,62,0.15)",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} stroke="#4caf50" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
          <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 1 0 2 .2 3 .5" />
          <path d="M22 12c0 5.5-2 8-5 10" />
          <path d="M10 22c1-2 1.5-4 1.5-6" />
          <path d="M17.5 8A4.5 4.5 0 0 1 18 12c0 3-1 5-3 7" />
          <path d="M14 12c0 2.5-.5 4-2 6" />
          <path d="M10 12a2 2 0 1 1 4 0" />
        </svg>
      </div>
      <div style={{ marginTop: 14, textAlign: "center", zIndex: 1 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Unlock with Biometrics</h3>
        <p style={{ fontSize: 8, color: "#6b7c6f" }}>Quick, secure access</p>
      </div>
      <div style={{ position: "absolute", bottom: 20, zIndex: 1 }}>
        <span style={{ fontSize: 8, color: "#4caf50", fontWeight: 600 }}>Use PIN Instead</span>
      </div>
    </div>
  );
}

function ScreenPIN() {
  const keys = [
    { n: "1", l: "" }, { n: "2", l: "ABC" }, { n: "3", l: "DEF" },
    { n: "4", l: "GHI" }, { n: "5", l: "JKL" }, { n: "6", l: "MNO" },
    { n: "7", l: "PQRS" }, { n: "8", l: "TUV" }, { n: "9", l: "WXYZ" },
    { n: "bio", l: "" }, { n: "0", l: "" }, { n: "del", l: "" },
  ];

  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <StatusBar />
      <div style={{ padding: "4px 12px 0", width: "100%" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={12} height={12} stroke="#333" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
      </div>
      <div style={{ marginTop: 6, textAlign: "center" }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>Create Your PIN</h3>
        <p style={{ fontSize: 8, color: "#999", marginTop: 1 }}>Set a 6-digit security PIN</p>
      </div>
      <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
        {[true, true, false, false, false, false].map((filled, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              border: `1.5px solid ${filled || i === 2 ? "#1B8C3E" : "#ddd"}`,
              background: filled ? "#1B8C3E" : "transparent",
            }}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 36px)", gap: 5, marginTop: "auto", marginBottom: 14 }}>
        {keys.map((k, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: k.n === "bio" ? "rgba(27,140,62,0.08)" : k.n === "del" ? "transparent" : "#f8f9fa",
            }}
          >
            {k.n === "bio" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={12} height={12} stroke="#1B8C3E" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                <path d="M10 12a2 2 0 1 1 4 0" />
              </svg>
            ) : k.n === "del" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={12} height={12} stroke="#333" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            ) : (
              <>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1 }}>{k.n}</span>
                {k.l && <span style={{ fontSize: 4.5, color: "#aaa", letterSpacing: 1, marginTop: 0.5 }}>{k.l}</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GooglePlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} fill="none">
      <path d="M3.609 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.384.22-.72.609-.92z" fill="#4285F4" />
      <path d="M17.657 8.137L5.05.904C4.717.708 4.34.656 4.003.752l9.79 9.79 3.864-2.405z" fill="#34A853" />
      <path d="M17.657 15.863l-3.864-3.864-9.79 9.79c.337.097.714.045 1.047-.152l12.607-5.774z" fill="#EA4335" />
      <path d="M21.177 10.65l-3.52-1.613-4.264 2.96 4.264 2.96 3.52-1.614c.7-.32.7-2.373 0-2.693z" fill="#FBBC04" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function MobileApp() {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Horizontal banner background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[70%]"
          style={{
            background: "linear-gradient(135deg, rgba(27,140,62,0.06) 0%, rgba(0,200,83,0.04) 50%, rgba(27,140,62,0.06) 100%)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[70%] border-y"
          style={{ borderColor: "var(--glass-border)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Phone mockups — compact */}
          <AnimatedSection className="order-2 lg:order-1 shrink-0">
            <div className="flex items-center justify-center -space-x-4" style={{ perspective: 1200 }}>
              <PhoneFrame variant="left">
                <ScreenOnboarding />
              </PhoneFrame>
              <PhoneFrame variant="center">
                <ScreenBiometric />
              </PhoneFrame>
              <PhoneFrame variant="right">
                <ScreenPIN />
              </PhoneFrame>
            </div>
          </AnimatedSection>

          {/* Text content — lighter */}
          <AnimatedSection delay={0.1} className="order-1 lg:order-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
              <Smartphone className="h-3 w-3" />
              {t("mobileApp.badge")}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {t("mobileApp.title")}{" "}
              <span className="web3-gradient-text">
                {t("mobileApp.titleHighlight")}
              </span>
            </h2>

            <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-md">
              {t("mobileApp.description")}
            </p>

            {/* Compact features */}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {["mobileApp.feature1", "mobileApp.feature2", "mobileApp.feature3", "mobileApp.feature4"].map((key) => (
                <div key={key} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t(key)}
                </div>
              ))}
            </div>

            {/* Store badges — smaller, more subtle */}
            <div className="mt-6 flex flex-row items-center lg:items-start gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[var(--text-primary)] px-4 py-2.5 text-[var(--background)] hover:opacity-90 transition-opacity duration-200"
              >
                <AppleIcon />
                <div className="text-left">
                  <div className="text-[8px] font-medium opacity-70 leading-none">{t("mobileApp.downloadOn")}</div>
                  <div className="text-[13px] font-semibold leading-tight mt-0.5">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[var(--text-primary)] px-4 py-2.5 text-[var(--background)] hover:opacity-90 transition-opacity duration-200"
              >
                <GooglePlayIcon />
                <div className="text-left">
                  <div className="text-[8px] font-medium opacity-70 leading-none">{t("mobileApp.getItOn")}</div>
                  <div className="text-[13px] font-semibold leading-tight mt-0.5">Google Play</div>
                </div>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
