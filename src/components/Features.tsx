"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Wallet,
  CreditCard,
  Building2,
  ArrowRight,
  Send,
  BarChart3,
  ShieldCheck,
  Bitcoin,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { WalletCards } from "./WalletCards";
import Image from "next/image";

/* ── Showcase Section Component ─────────────────────────── */
function ShowcaseSection({
  id,
  label,
  labelIcon: LabelIcon,
  title,
  titleHighlight,
  titleHighlightGold,
  description,
  features,
  image,
  imageBadge,
  reverse,
  children,
}: {
  id?: string;
  label: string;
  labelIcon: React.ElementType;
  title: string;
  titleHighlight: string;
  titleHighlightGold?: boolean;
  description: string;
  features: { icon: React.ElementType; title: string; description?: string; gold?: boolean }[];
  image?: { src: string; alt: string };
  imageBadge?: { icon: React.ElementType; title: string; description: string; gold?: boolean };
  reverse?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="relative py-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div
            className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 md:py-28 ${
              reverse ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
            }`}
          >
            {/* Image / Visual */}
            <div className="relative">
              {children ? (
                children
              ) : image ? (
                <div className="relative rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40 group">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={800}
                    height={500}
                    className="w-full h-[360px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]/60" />
                  {imageBadge && (
                    <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--glass-border)] px-5 py-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          imageBadge.gold ? "bg-amber-500/15" : "bg-[#36D399]/15"
                        }`}
                      >
                        <imageBadge.icon
                          className={`h-5 w-5 ${imageBadge.gold ? "text-amber-400" : "text-[#36D399]"}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{imageBadge.title}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{imageBadge.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Text */}
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-[0.15em] ${
                  titleHighlightGold
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                    : "border-[#36D399]/30 bg-[#36D399]/10 text-[#36D399]"
                }`}
              >
                <LabelIcon className="h-3.5 w-3.5" />
                {label}
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-5">
                {title}{" "}
                <span
                  className={`bg-clip-text text-transparent ${
                    titleHighlightGold
                      ? "bg-gradient-to-r from-amber-400 to-amber-300"
                      : "bg-gradient-to-r from-[#36D399] to-[#4AE8AC]"
                  }`}
                >
                  {titleHighlight}
                </span>
              </h2>

              <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-7 max-w-lg">{description}</p>

              <div className="flex flex-col gap-3">
                {features.map((feat) => (
                  <motion.div
                    key={feat.title}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[#36D399]/15 hover:bg-[#36D399]/[0.03] transition-all duration-300"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        feat.gold ? "bg-amber-500/10" : "bg-[#36D399]/10"
                      }`}
                    >
                      <feat.icon
                        className={`h-[18px] w-[18px] ${feat.gold ? "text-amber-400" : "text-[#36D399]"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{feat.title}</p>
                      {feat.description && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{feat.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#36D399]/12 to-transparent" />
      </div>
    </section>
  );
}

/* ── Flip Card Display ────────────────────────────────────── */
const LOGO_URL = "https://res.cloudinary.com/dxvi5d6dr/image/upload/v1766762874/photo_2025-12-24_18.04.43-removebg-preview_ck9wyx.png";

function CardsDisplay() {
  return (
    <div className="relative w-full min-h-[400px] flex items-center justify-center">
      {/* Main flip card */}
      <div className="flip-card">
        <div className="flip-card-inner">
          {/* ── FRONT ── */}
          <div className="flip-card-front">
            {/* Background gradient */}
            <div className="fc-bg" />
            <div className="fc-glow" />

            {/* Logo + Brand */}
            <div className="fc-brand">
              <img src={LOGO_URL} alt="" className="fc-logo" />
              <span className="fc-brand-name">CRYMAD CASH</span>
            </div>

            {/* Tier badge */}
            <span className="fc-tier">PLATINUM</span>

            {/* Chip */}
            <svg className="fc-chip" viewBox="0 0 50 38">
              <rect x="1" y="1" width="48" height="36" rx="6" fill="#C9A84C" />
              <rect x="1" y="1" width="48" height="36" rx="6" fill="none" stroke="#a88a3a" strokeWidth=".6" />
              <line x1="1" y1="13" x2="49" y2="13" stroke="#a88a3a" strokeWidth=".7" />
              <line x1="1" y1="25" x2="49" y2="25" stroke="#a88a3a" strokeWidth=".7" />
              <line x1="17" y1="1" x2="17" y2="13" stroke="#a88a3a" strokeWidth=".7" />
              <line x1="33" y1="25" x2="33" y2="37" stroke="#a88a3a" strokeWidth=".7" />
              <line x1="25" y1="13" x2="25" y2="25" stroke="#a88a3a" strokeWidth=".5" />
            </svg>

            {/* Contactless */}
            <svg className="fc-contactless" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 17a7 7 0 0 1 0-10" />
              <path d="M9.5 14.5a3.5 3.5 0 0 1 0-5" />
              <circle cx="3" cy="12" r=".5" fill="rgba(255,255,255,0.4)" stroke="none" />
            </svg>

            {/* Card number */}
            <p className="fc-number">4829 &nbsp; 7340 &nbsp; 1256 &nbsp; 8891</p>

            {/* Holder + Expiry */}
            <div className="fc-details">
              <div>
                <span className="fc-label">VALID THRU</span>
                <span className="fc-value">12/28</span>
              </div>
              <div>
                <span className="fc-label">CARD HOLDER</span>
                <span className="fc-value">ALEX MORGAN</span>
              </div>
            </div>

            {/* Network logo */}
            <svg className="fc-network" viewBox="0 0 48 30">
              <circle cx="17" cy="15" r="11" fill="#EB001B" opacity=".9" />
              <circle cx="31" cy="15" r="11" fill="#F79E1B" opacity=".9" />
              <path d="M24 6.2a11 11 0 0 1 0 17.6 11 11 0 0 1 0-17.6z" fill="#FF5F00" />
            </svg>
          </div>

          {/* ── BACK ── */}
          <div className="flip-card-back">
            <div className="fc-bg" />
            <div className="fc-glow" />

            {/* Magnetic strip */}
            <div className="fc-strip" />

            {/* Signature + CVV area */}
            <div className="fc-sig-area">
              <div className="fc-sig-strip">
                <span className="fc-sig-text">ALEX MORGAN</span>
              </div>
              <div className="fc-cvv-strip">
                <span className="fc-cvv">832</span>
              </div>
            </div>

            {/* Bottom info */}
            <div className="fc-back-info">
              <img src={LOGO_URL} alt="" className="fc-back-logo" />
              <p className="fc-back-text">
                This card is property of Crymad Cash Ltd.<br />
                Use is subject to the cardholder agreement.
              </p>
              <p className="fc-back-support">support@crymadcash.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-0 z-30 hidden md:flex items-center gap-2 rounded-xl bg-[var(--background)]/85 backdrop-blur-xl border border-[var(--glass-border)] px-4 py-2.5 shadow-xl"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-xs font-medium text-[var(--text-primary)]">Hover to flip</span>
      </motion.div>

      {/* styles in globals.css */}
    </div>
  );
}

/* ── Main Features Component ─────────────────────────────── */
export function Features() {
  return (
    <>
      {/* Why Choose Us — Animated Banner */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Animated Banner ── */}
          <AnimatedSection className="mb-16 md:mb-20">
            <div className="features-banner relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--surface)] p-8 md:p-12 lg:p-16">
              {/* Animated gradient border glow */}
              <div className="absolute inset-0 rounded-3xl opacity-40" style={{
                background: "linear-gradient(135deg, transparent 30%, rgba(54,211,153,0.15) 50%, transparent 70%)",
                backgroundSize: "200% 200%",
                animation: "bannerShimmer 6s ease-in-out infinite",
              }} />

              {/* Floating orbs */}
              <motion.div
                animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-[15%] w-32 h-32 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #36D399, transparent 70%)", filter: "blur(40px)" }}
              />
              <motion.div
                animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-4 left-[10%] w-40 h-40 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #C9A84C, transparent 70%)", filter: "blur(50px)" }}
              />
              <motion.div
                animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-[60%] w-24 h-24 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #4AE8AC, transparent 70%)", filter: "blur(30px)" }}
              />

              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />

              {/* Content */}
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#36D399]/30 bg-[#36D399]/10 text-[#36D399] px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-[0.15em]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Why Choose Us
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]"
                >
                  All-in-One Financial{" "}
                  <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                    Platform
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-5 text-lg text-[var(--text-secondary)] leading-relaxed"
                >
                  Crymad Cash brings together essential financial services into a single platform.
                  Manage payments, digital wallets, and global transfers without the complexity.
                </motion.p>

                {/* Animated keyword ticker */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 flex justify-center gap-3 flex-wrap"
                >
                  {["Multi-Currency", "Instant Transfers", "Crypto Ready", "Bank-Grade Security", "Global Reach", "API Powered"].map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-xs text-[var(--text-secondary)] font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#36D399]/60" />
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: "Global Payments", desc: "Send and receive money worldwide with support for multiple currencies.", bottom: "Worldwide", variant: "" },
              { icon: Wallet, title: "Crypto Integration", desc: "Access digital asset functionality directly from your wallet.", bottom: "Digital Assets", variant: "lux-card-gold" },
              { icon: Building2, title: "Built for Business", desc: "Scalable financial solutions for businesses with API connectivity.", bottom: "Enterprise", variant: "" },
              { icon: ShieldCheck, title: "Secure by Design", desc: "Advanced security including encryption and multi-factor auth.", bottom: "Protected", variant: "lux-card-gold" },
            ].map((feat, i) => (
              <AnimatedSection key={feat.title} delay={i * 0.1}>
                <div className={`lux-card ${feat.variant}`}>
                  <div className="lux-border" />
                  <div className="lux-content">
                    <div className="lux-icon-wrap">
                      <feat.icon className="w-full h-full" strokeWidth={1.5} />
                      <div className="lux-trail" />
                    </div>
                    <span className="lux-title">{feat.title}</span>
                  </div>
                  <p className="lux-desc">{feat.desc}</p>
                  <span className="lux-bottom-text">{feat.bottom}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#36D399]/12 to-transparent" />
        </div>
      </section>

      {/* Showcase 1: Global Payments */}
      <ShowcaseSection
        id="global-payments"
        label="Global Payments"
        labelIcon={Globe}
        title="Send Money"
        titleHighlight="Anywhere in the World"
        description="Send and receive money worldwide with support for multiple currencies, helping reduce unnecessary exchange costs and simplifying international transactions."
        features={[
          { icon: Send, title: "Instant Cross-Border Transfers" },
          { icon: Wallet, title: "Multi-Currency Accounts" },
          { icon: BarChart3, title: "Competitive Exchange Rates" },
        ]}
      >
        <div className="relative rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/global-payments.gif"
            alt="Global payments virtual card"
            className="w-full h-[360px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]/60" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--glass-border)] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#36D399]/15">
              <Globe className="h-5 w-5 text-[#36D399]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">150+ Countries</p>
              <p className="text-xs text-[var(--text-secondary)]">Send money worldwide instantly</p>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      {/* Showcase 2: Crypto Integration */}
      <ShowcaseSection
        label="Crypto Integration"
        labelIcon={Bitcoin}
        title="Traditional & Digital Assets,"
        titleHighlight="One Wallet"
        titleHighlightGold
        description="Access digital asset functionality directly from your wallet. Manage both traditional currencies and cryptocurrencies including Bitcoin, Ethereum, USDT, and USDC."
        reverse
        features={[
          { icon: BarChart3, title: "Real-Time Crypto Portfolio", gold: true },
          { icon: ArrowRight, title: "Buy, Sell & Hold Digital Assets", gold: true },
          { icon: ShieldCheck, title: "Secure Cold Storage", gold: true },
        ]}
      >
        <div className="relative rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/crypto-integration.gif"
            alt="Crypto integration virtual card"
            className="w-full h-[360px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]/60" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--glass-border)] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <Bitcoin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Crypto Enabled</p>
              <p className="text-xs text-[var(--text-secondary)]">BTC, ETH, USDT & more</p>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      {/* Showcase 3: Cards — Combined Flip Card + Wallet */}
      <section className="relative py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto pt-20 md:pt-28 mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#36D399]/30 bg-[#36D399]/10 text-[#36D399] px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-[0.15em]">
                <CreditCard className="h-3.5 w-3.5" />
                Cards & Wallet
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-5">
                Virtual & Physical{" "}
                <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                  Cards for Every Need
                </span>
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                Get instant virtual cards for online spending and physical cards for in-store purchases.
                All your cards organized in one secure digital wallet.
              </p>
            </div>

            {/* Two cards side by side */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pb-12">
              {/* Flip Card */}
              <div className="flex flex-col items-center">
                <CardsDisplay />
                <p className="text-xs text-[var(--text-tertiary)] mt-4 italic">Hover card to flip</p>
              </div>

              {/* Wallet */}
              <div className="flex flex-col items-center">
                <WalletCards />
              </div>
            </div>

            {/* Features row below */}
            <div className="grid sm:grid-cols-3 gap-4 pb-20 md:pb-28">
              {[
                { icon: ArrowRight, title: "Instant Virtual Card Creation", desc: "Generate a new virtual card in seconds" },
                { icon: Globe, title: "Spend in Any Currency", desc: "Automatic conversion at competitive rates" },
                { icon: ShieldCheck, title: "Freeze & Unfreeze Instantly", desc: "Full control from your app at any time" },
              ].map((feat) => (
                <motion.div
                  key={feat.title}
                  whileHover={{ y: -3 }}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[#36D399]/15 hover:bg-[#36D399]/[0.03] transition-all duration-300"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#36D399]/10">
                    <feat.icon className="h-[18px] w-[18px] text-[#36D399]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{feat.title}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#36D399]/12 to-transparent" />
        </div>
      </section>

      {/* Showcase 4: Business */}
      <ShowcaseSection
        id="business"
        label="For Business"
        labelIcon={Building2}
        title="Financial Infrastructure for"
        titleHighlight="Modern Business"
        titleHighlightGold
        description="Crymad Cash business accounts provide powerful financial tools designed for global operations. Enable payouts, integrate payments, and manage multi-currency accounts at scale."
        reverse
        image={{
          src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
          alt: "Business financial dashboard and analytics",
        }}
        imageBadge={{
          icon: Building2,
          title: "API Ready",
          description: "Seamless business integration",
          gold: true,
        }}
        features={[
          { icon: ArrowRight, title: "Global Payouts to Teams & Partners", gold: true },
          { icon: Building2, title: "Secure API & Payment Integration", gold: true },
          { icon: Bitcoin, title: "Accept Crypto Payments", gold: true },
        ]}
      />
    </>
  );
}
