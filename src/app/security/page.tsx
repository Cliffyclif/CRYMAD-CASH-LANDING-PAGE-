"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Fingerprint,
  Server,
  Globe,
  AlertTriangle,
  KeyRound,
  FileCheck,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Check,
  Smartphone,
  Database,
  RefreshCw,
  Users,
  Scale,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const securityLayers = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description:
      "All data at rest and in transit is protected with AES-256 encryption — the same standard used by governments and top financial institutions worldwide.",
  },
  {
    icon: Fingerprint,
    title: "Multi-Factor Authentication",
    description:
      "Every account is secured with MFA including biometric authentication, hardware security keys, SMS, and authenticator app support.",
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description:
      "Our systems continuously monitor all transactions and account activity 24/7 using AI-driven anomaly detection to flag suspicious behavior instantly.",
  },
  {
    icon: AlertTriangle,
    title: "Advanced Fraud Detection",
    description:
      "Machine learning models analyze transaction patterns, device fingerprints, and behavioral signals to prevent fraudulent activity before it occurs.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description:
      "Our platform runs on enterprise-grade cloud infrastructure with redundant data centers, DDoS protection, and automated failover to ensure 99.99% uptime.",
  },
  {
    icon: KeyRound,
    title: "End-to-End Encryption",
    description:
      "All communications between your device and our servers are encrypted using TLS 1.3. API keys and sensitive credentials are stored in hardware security modules (HSMs).",
  },
];

const complianceFrameworks = [
  {
    icon: FileCheck,
    title: "KYC / AML",
    description:
      "Robust Know Your Customer and Anti-Money Laundering procedures ensure every user is verified and every transaction is screened against global watchlists and sanctions databases.",
  },
  {
    icon: Scale,
    title: "Regulatory Compliance",
    description:
      "We operate in partnership with licensed financial institutions and comply with local and international financial regulations across all jurisdictions we serve.",
  },
  {
    icon: ShieldCheck,
    title: "PCI DSS Compliant",
    description:
      "Our card processing infrastructure meets the Payment Card Industry Data Security Standard, ensuring your card data is handled with the highest level of protection.",
  },
  {
    icon: Globe,
    title: "GDPR & Data Protection",
    description:
      "We adhere to the General Data Protection Regulation and equivalent data privacy laws, giving you full control over your personal data with transparent processing practices.",
  },
];

const accountSecurityFeatures = [
  {
    icon: Smartphone,
    title: "Instant Card Controls",
    description: "Freeze or unfreeze your card instantly from the app. Set spending limits, disable online payments, or block ATM withdrawals with a single tap.",
  },
  {
    icon: RefreshCw,
    title: "Session Management",
    description: "View all active sessions and devices connected to your account. Revoke access from any device remotely at any time.",
  },
  {
    icon: Database,
    title: "Automated Backups",
    description: "Your account data is continuously backed up across geographically distributed data centers, ensuring zero data loss and rapid recovery.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Business accounts support granular role-based permissions, allowing you to control exactly what team members can view and do.",
  },
];

const securityPractices = [
  "All employee access requires MFA and is logged",
  "Regular third-party penetration testing and security audits",
  "Bug bounty program for responsible vulnerability disclosure",
  "Segregation of customer funds from operational funds",
  "Automated alerts for login attempts and sensitive changes",
  "IP whitelisting and geo-restriction for API access",
  "SOC 2 Type II aligned security controls",
  "Incident response team available 24/7",
];

type ContactChannel = "support" | "business" | "compliance";

export default function SecurityPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactChannel, setContactChannel] = useState<ContactChannel>("compliance");

  const openModal = (channel: ContactChannel) => {
    setContactChannel(channel);
    setContactOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--section-alt)] to-[var(--background)]" />
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-amber-400/5 rounded-full blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-amber-400 mb-6">
                <Shield className="h-3.5 w-3.5" />
                Security
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]">
                Your Money,{" "}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Protected
                </span>
              </h1>
              <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                Security is the foundation of everything we build. From bank-grade encryption to real-time fraud detection, every layer of Crymad Cash is engineered to keep your money and data safe.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-10 border-y border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {[
                { label: "AES-256 Encryption", icon: Lock },
                { label: "PCI DSS Compliant", icon: ShieldCheck },
                { label: "GDPR Compliant", icon: FileCheck },
                { label: "24/7 Monitoring", icon: Eye },
                { label: "KYC / AML Verified", icon: BadgeCheck },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
                >
                  <item.icon className="h-4.5 w-4.5 text-amber-400" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Layers */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-amber-400 uppercase tracking-widest mb-4">
                Defence in Depth
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Multi-Layered{" "}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Security
                </span>
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Multiple independent security controls working together so that no single point of failure can compromise your account.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityLayers.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] p-6 hover:border-amber-400/20 hover:shadow-lg hover:shadow-amber-400/5 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 mb-4">
                    <item.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance & Regulatory */}
        <section className="py-20 md:py-28 bg-[var(--section-alt)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-amber-400 uppercase tracking-widest mb-4">
                Compliance
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Regulatory{" "}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                We meet and exceed global regulatory standards, working with licensed partners to deliver compliant financial services.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {complianceFrameworks.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] p-6 hover:border-amber-400/20 transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                    <item.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Account Security Features */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-amber-400 uppercase tracking-widest mb-4">
                You&apos;re In Control
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Account{" "}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Security Tools
                </span>
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Powerful tools that put you in complete control of your account security.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {accountSecurityFeatures.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] p-6 hover:border-amber-400/20 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 mb-4">
                    <item.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Security Practices */}
        <section className="py-20 md:py-28 bg-[var(--section-alt)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div {...fadeUp}>
                <span className="inline-block text-sm font-semibold text-amber-400 uppercase tracking-widest mb-4">
                  Behind the Scenes
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
                  Our Internal{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                    Security Practices
                  </span>
                </h2>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
                  Security isn&apos;t just a feature — it&apos;s embedded in our culture, our engineering processes, and every decision we make.
                </p>

                <div className="flex flex-col gap-3">
                  {securityPractices.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-400/10">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
                <div className="relative rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/30">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-[500px] object-cover"
                  >
                    <source src="/security-bg.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-elevated)]/90 backdrop-blur-md border border-[var(--glass-border)] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                        <Shield className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Always Protected</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Your security is monitored 24/7/365</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Responsible Disclosure */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-8 md:p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10">
                  <AlertTriangle className="h-7 w-7 text-amber-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Found a Vulnerability?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-6">
                We take security seriously and appreciate responsible disclosure. If you&apos;ve discovered a potential vulnerability in our platform, please report it to our security team. We investigate all reports promptly and work to resolve issues as quickly as possible.
              </p>
              <button
                type="button"
                onClick={() => openModal("compliance")}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-[#1a1a1a] hover:brightness-110 transition-all"
              >
                Report a Vulnerability
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 bg-[var(--section-alt)]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Ready to bank with confidence?
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)]">
                Join thousands of users who trust Crymad Cash with their finances across 50+ countries.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://production-crmdx.web.app/sign-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/25"
                >
                  Open an Account
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => openModal("support")}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-8 py-3.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 transition-all"
                >
                  Contact Us
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} channel={contactChannel} />
    </>
  );
}
