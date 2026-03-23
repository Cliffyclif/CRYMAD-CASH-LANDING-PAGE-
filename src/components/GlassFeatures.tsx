"use client";

import { AnimatedSection } from "./AnimatedSection";
import { useLanguage } from "@/i18n/LanguageContext";

const featureKeys = [
  { labelKey: "glassFeatures.multiCurrency", descKey: "glassFeatures.multiCurrencyDesc", color: "#00E89D", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )},
  { labelKey: "glassFeatures.digitalEWallets", descKey: "glassFeatures.digitalEWalletsDesc", color: "#00F0FF", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )},
  { labelKey: "glassFeatures.globalPayments", descKey: "glassFeatures.globalPaymentsDesc", color: "#A855F7", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )},
  { labelKey: "glassFeatures.cryptoTools", descKey: "glassFeatures.cryptoToolsDesc", color: "#F59E0B", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
    </svg>
  )},
  { labelKey: "glassFeatures.virtualPhysicalCards", descKey: "glassFeatures.virtualPhysicalCardsDesc", color: "#00F0FF", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )},
  { labelKey: "glassFeatures.realTimeMonitoring", descKey: "glassFeatures.realTimeMonitoringDesc", color: "#EC4899", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )},
  { labelKey: "glassFeatures.bankGradeSecurity", descKey: "glassFeatures.bankGradeSecurityDesc", color: "#00E89D", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )},
];

export function GlassFeatures() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[var(--background)]">
      {/* Web3 background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-12" style={{
        background: "radial-gradient(ellipse, var(--primary), transparent 60%)",
        filter: "blur(80px)",
      }} />
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full opacity-8" style={{
        background: "radial-gradient(circle, var(--neon-purple), transparent 60%)",
        filter: "blur(60px)",
      }} />
      <div className="absolute bottom-[20%] left-[15%] w-[250px] h-[250px] rounded-full opacity-6" style={{
        background: "radial-gradient(circle, var(--neon-cyan), transparent 60%)",
        filter: "blur(60px)",
      }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)] px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-[0.15em] backdrop-blur-sm neon-border">
            {t("glassFeatures.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("glassFeatures.title")}{" "}
            <span className="web3-gradient-text">
              {t("glassFeatures.titleHighlight")}
            </span>
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            {t("glassFeatures.description")}
          </p>
        </AnimatedSection>

        {/* Glass cards */}
        <AnimatedSection>
          <div className="gc-container">
            {featureKeys.map((feat, i) => {
              const label = t(feat.labelKey);
              return (
                <div
                  key={feat.labelKey}
                  className="gc-glass"
                  data-text={label}
                  style={{
                    "--r": `${(i - 3) * 10}`,
                    "--accent": feat.color,
                  } as React.CSSProperties}
                >
                  <div className="gc-icon-wrap" style={{ color: feat.color }}>
                    {feat.icon}
                  </div>
                  <div className="gc-desc">{t(feat.descKey)}</div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
