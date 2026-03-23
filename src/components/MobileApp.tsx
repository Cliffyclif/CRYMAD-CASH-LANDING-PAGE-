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
    left: "perspective(1200px) rotateY(8deg) scale(0.88)",
    center: "scale(1.02)",
    right: "perspective(1200px) rotateY(-8deg) scale(0.88)",
  };
  const zIndex = variant === "center" ? 3 : 1;
  const shadow =
    variant === "center"
      ? "0 0 0 1px rgba(255,255,255,0.15), 0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(27,140,62,0.15)"
      : "0 0 0 1px rgba(255,255,255,0.1), 0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(27,140,62,0.08)";

  return (
    <div
      className="shrink-0"
      style={{
        width: 220,
        height: 460,
        borderRadius: 30,
        background: "#000",
        padding: 6,
        boxShadow: shadow,
        transform: transforms[variant],
        zIndex,
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 96,
            height: 22,
            background: "#000",
            borderRadius: "0 0 14px 14px",
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
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontSize: 11,
        fontWeight: 600,
        color,
        position: "relative",
        zIndex: 10,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={11} height={11}>
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={11} height={11}>
          <rect x="17" y="4" width="4" height="16" rx="1" />
          <rect x="11" y="8" width="4" height="12" rx="1" />
          <rect x="5" y="12" width="4" height="8" rx="1" />
        </svg>
      </div>
    </div>
  );
}

/* ---- Screen 1: Onboarding ---- */
function ScreenOnboarding() {
  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ padding: "4px 16px", textAlign: "right", fontSize: 11, color: "#1B8C3E", fontWeight: 600 }}>
        Skip
      </div>
      <div
        style={{
          flex: "0 0 200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0faf3, #e8f5e9)",
          margin: "0 12px",
          borderRadius: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", background: "rgba(27,140,62,0.06)" }} />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={70} height={70} stroke="#1B8C3E" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
        </svg>
      </div>
      <div style={{ flex: 1, padding: "18px 16px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 6 }}>
          Manage Your Money, Anywhere
        </h3>
        <p style={{ fontSize: 10.5, color: "#777", lineHeight: 1.5 }}>
          Access your e-wallet, bank accounts, and crypto — all in one place.
        </p>
      </div>
      <div style={{ padding: "0 16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 16, height: 5, borderRadius: 3, background: "linear-gradient(90deg, #1B8C3E, #00C853)" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ddd" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ddd" }} />
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1B8C3E, #00C853)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(27,140,62,0.35)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={14} height={14} stroke="#fff" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---- Screen 2: Biometric (center) ---- */
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
      {/* Rings */}
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(27,140,62,0.06)" }} />
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(27,140,62,0.1)" }} />
      {/* Fingerprint */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(27,140,62,0.1)",
          border: "2px solid rgba(27,140,62,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          boxShadow: "0 0 24px rgba(27,140,62,0.15)",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} stroke="#4caf50" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
          <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 1 0 2 .2 3 .5" />
          <path d="M22 12c0 5.5-2 8-5 10" />
          <path d="M10 22c1-2 1.5-4 1.5-6" />
          <path d="M17.5 8A4.5 4.5 0 0 1 18 12c0 3-1 5-3 7" />
          <path d="M14 12c0 2.5-.5 4-2 6" />
          <path d="M10 12a2 2 0 1 1 4 0" />
        </svg>
      </div>
      <div style={{ marginTop: 18, textAlign: "center", zIndex: 1 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Unlock with Biometrics</h3>
        <p style={{ fontSize: 10, color: "#6b7c6f" }}>Quick, secure access to your account</p>
      </div>
      <div style={{ position: "absolute", bottom: 28, zIndex: 1 }}>
        <span style={{ fontSize: 10, color: "#4caf50", fontWeight: 600 }}>Use PIN Instead</span>
      </div>
    </div>
  );
}

/* ---- Screen 3: PIN ---- */
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
      <div style={{ padding: "8px 16px 0", width: "100%" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} stroke="#333" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </div>
      <div style={{ marginTop: 10, textAlign: "center" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Create Your PIN</h3>
        <p style={{ fontSize: 10, color: "#999", marginTop: 2 }}>Set a 6-digit security PIN</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {[true, true, false, false, false, false].map((filled, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: `2px solid ${filled || i === 2 ? "#1B8C3E" : "#ddd"}`,
              background: filled ? "#1B8C3E" : "transparent",
              boxShadow: i === 2 ? "0 0 0 2px rgba(27,140,62,0.15)" : "none",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 48px)",
          gap: 8,
          marginTop: "auto",
          marginBottom: 20,
        }}
      >
        {keys.map((k, i) => (
          <div
            key={i}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: k.n === "bio" ? "rgba(27,140,62,0.08)" : k.n === "del" ? "transparent" : "#f8f9fa",
            }}
          >
            {k.n === "bio" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} stroke="#1B8C3E" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                <path d="M10 12a2 2 0 1 1 4 0" />
              </svg>
            ) : k.n === "del" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} stroke="#333" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            ) : (
              <>
                <span style={{ fontSize: 17, fontWeight: 600, color: "#222", lineHeight: 1 }}>{k.n}</span>
                {k.l && <span style={{ fontSize: 5.5, color: "#aaa", letterSpacing: 1.5, marginTop: 1 }}>{k.l}</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Google Play SVG Badge ---- */
function GooglePlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill="none">
      <path d="M3.609 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.384.22-.72.609-.92z" fill="#4285F4" />
      <path d="M17.657 8.137L5.05.904C4.717.708 4.34.656 4.003.752l9.79 9.79 3.864-2.405z" fill="#34A853" />
      <path d="M17.657 15.863l-3.864-3.864-9.79 9.79c.337.097.714.045 1.047-.152l12.607-5.774z" fill="#EA4335" />
      <path d="M21.177 10.65l-3.52-1.613-4.264 2.96 4.264 2.96 3.52-1.614c.7-.32.7-2.373 0-2.693z" fill="#FBBC04" />
    </svg>
  );
}

/* ---- Apple SVG Icon ---- */
function AppleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function MobileApp() {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-[var(--section-alt)] to-[var(--background)]">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, var(--primary) 0%, transparent 50%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Phone mockups */}
          <AnimatedSection className="order-2 lg:order-1">
            <div className="flex items-center justify-center gap-[-8px]" style={{ perspective: 1200 }}>
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

          {/* Text content */}
          <AnimatedSection delay={0.15} className="order-1 lg:order-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary)] mb-6 backdrop-blur-sm neon-border">
              <Smartphone className="h-3.5 w-3.5" />
              {t("mobileApp.badge")}
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              {t("mobileApp.title")}{" "}
              <span className="web3-gradient-text">
                {t("mobileApp.titleHighlight")}
              </span>
            </h2>

            <p className="mt-5 text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {t("mobileApp.description")}
            </p>

            {/* Features */}
            <div className="mt-8 flex flex-col gap-3">
              {["mobileApp.feature1", "mobileApp.feature2", "mobileApp.feature3", "mobileApp.feature4"].map((key) => (
                <div key={key} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {t(key)}
                </div>
              ))}
            </div>

            {/* Store badges */}
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-[#111] dark:bg-white/10 px-6 py-3.5 text-white hover:bg-[#222] dark:hover:bg-white/15 transition-all duration-300 border border-transparent dark:border-white/10 shadow-lg hover:shadow-xl"
              >
                <AppleIcon />
                <div className="text-left">
                  <div className="text-[10px] font-medium opacity-80 leading-none">{t("mobileApp.downloadOn")}</div>
                  <div className="text-[15px] font-bold leading-tight mt-0.5">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-[#111] dark:bg-white/10 px-6 py-3.5 text-white hover:bg-[#222] dark:hover:bg-white/15 transition-all duration-300 border border-transparent dark:border-white/10 shadow-lg hover:shadow-xl"
              >
                <GooglePlayIcon />
                <div className="text-left">
                  <div className="text-[10px] font-medium opacity-80 leading-none">{t("mobileApp.getItOn")}</div>
                  <div className="text-[15px] font-bold leading-tight mt-0.5">Google Play</div>
                </div>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
