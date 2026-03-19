"use client";

import { AnimatedSection } from "./AnimatedSection";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    label: "Multi-Currency",
    description: "Hold and manage funds in multiple currencies, making it easier to send and receive international payments.",
    color: "#36D399",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    label: "Digital E-Wallets",
    description: "Access a secure e-wallet to manage funds, transfer money, and track transactions in real time.",
    color: "#4AE8AC",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    label: "Global Payments & Transfers",
    description: "Send and receive money worldwide with support for multiple currencies.",
    color: "#C9A84C",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
      </svg>
    ),
    label: "Crypto-Enabled Tools",
    description: "Access digital asset functionality directly from your wallet.",
    color: "#36D399",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    label: "Virtual & Physical Cards",
    description: "Virtual and physical cards for online and in-store purchases, and ATM withdrawals.",
    color: "#4AE8AC",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    label: "Real-Time Monitoring",
    description: "Real-time transaction monitoring to help protect your account and financial activity.",
    color: "#C9A84C",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="gc-icon">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    label: "Bank-Grade Security",
    description: "Advanced encryption, authentication systems, and transaction monitoring.",
    color: "#36D399",
  },
];

export function GlassFeatures() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[var(--background)]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15" style={{
        background: "radial-gradient(ellipse, #36D399, transparent 70%)",
        filter: "blur(80px)",
      }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#36D399]/30 bg-[#36D399]/10 text-[#36D399] px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-[0.15em]">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            From multi-currency accounts to crypto tools — manage your entire financial life in one place.
          </p>
        </AnimatedSection>

        {/* Glass cards */}
        <AnimatedSection>
          <div className="gc-container">
            {features.map((feat, i) => (
              <div
                key={feat.label}
                className="gc-glass"
                data-text={feat.label}
                style={{
                  "--r": `${(i - 3) * 10}`,
                  "--accent": feat.color,
                } as React.CSSProperties}
              >
                <div className="gc-icon-wrap" style={{ color: feat.color }}>
                  {feat.icon}
                </div>
                <div className="gc-desc">{feat.description}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
