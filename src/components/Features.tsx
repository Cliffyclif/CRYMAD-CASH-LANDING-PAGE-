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
import { useLanguage } from "@/i18n/LanguageContext";

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
                      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-[var(--neon-purple)]"
                      : "web3-gradient-text"
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
  const { t } = useLanguage();

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
                <span className="fc-label">{t("features.validThru")}</span>
                <span className="fc-value">12/28</span>
              </div>
              <div>
                <span className="fc-label">{t("features.cardHolder")}</span>
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
                {t("features.cardProperty")}<br />
                {t("features.cardAgreement")}
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
        <span className="text-xs font-medium text-[var(--text-primary)]">{t("features.hoverToFlip")}</span>
      </motion.div>

      {/* styles in globals.css */}
    </div>
  );
}

/* ── Main Features Component ─────────────────────────────── */
export function Features() {
  const { t } = useLanguage();

  return (
    <>
      {/* Why Choose Us — Animated Banner */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Animated Banner ── */}
          <AnimatedSection className="mb-16 md:mb-20">
            <div className="features-banner relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--surface)] p-8 md:p-12 lg:p-16">
              {/* Animated gradient mesh glow */}
              <div className="absolute inset-0 rounded-3xl opacity-40" style={{
                background: "linear-gradient(135deg, transparent 20%, rgba(0,232,157,0.12) 40%, rgba(0,240,255,0.08) 60%, transparent 80%)",
                backgroundSize: "200% 200%",
                animation: "bannerShimmer 6s ease-in-out infinite",
              }} />

              {/* Floating orbs — Web3 neon colors */}
              <motion.div
                animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-[15%] w-32 h-32 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)", filter: "blur(40px)" }}
              />
              <motion.div
                animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-4 left-[10%] w-40 h-40 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, var(--neon-purple), transparent 70%)", filter: "blur(50px)" }}
              />
              <motion.div
                animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-[60%] w-24 h-24 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, var(--neon-cyan), transparent 70%)", filter: "blur(30px)" }}
              />

              {/* Cyber grid pattern */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: "linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)",
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
                    {t("features.whyChooseUs")}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]"
                >
                  {t("features.allInOneTitle")}{" "}
                  <span className="web3-gradient-text">
                    {t("features.allInOneTitleHighlight")}
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-5 text-lg text-[var(--text-secondary)] leading-relaxed"
                >
                  {t("features.allInOneDesc")}
                </motion.p>

                {/* Animated keyword ticker */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 flex justify-center gap-3 flex-wrap"
                >
                  {[
                    t("features.multiCurrency"),
                    t("features.instantTransfers"),
                    t("features.cryptoReady"),
                    t("features.bankGradeSecurity"),
                    t("features.globalReach"),
                    t("features.apiPowered"),
                  ].map((tag, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm px-3.5 py-1.5 text-xs text-[var(--text-secondary)] font-medium hover:border-[var(--primary)]/20 transition-colors duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" style={{ boxShadow: "0 0 6px var(--primary)" }} />
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, titleKey: "features.globalPayments", descKey: "features.globalPaymentsDesc", bottomKey: "features.worldwide", variant: "" },
              { icon: Wallet, titleKey: "features.cryptoIntegration", descKey: "features.cryptoIntegrationDesc", bottomKey: "features.digitalAssets", variant: "lux-card-gold" },
              { icon: Building2, titleKey: "features.builtForBusiness", descKey: "features.builtForBusinessDesc", bottomKey: "features.enterprise", variant: "" },
              { icon: ShieldCheck, titleKey: "features.secureByDesign", descKey: "features.secureByDesignDesc", bottomKey: "features.protected", variant: "lux-card-gold" },
            ].map((feat, i) => (
              <AnimatedSection key={feat.titleKey} delay={i * 0.1}>
                <div className={`lux-card ${feat.variant}`}>
                  <div className="lux-border" />
                  <div className="lux-content">
                    <div className="lux-icon-wrap">
                      <feat.icon className="w-full h-full" strokeWidth={1.5} />
                      <div className="lux-trail" />
                    </div>
                    <span className="lux-title">{t(feat.titleKey)}</span>
                  </div>
                  <p className="lux-desc">{t(feat.descKey)}</p>
                  <span className="lux-bottom-text">{t(feat.bottomKey)}</span>
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
        label={t("features.globalPayments")}
        labelIcon={Globe}
        title={t("features.sendMoney")}
        titleHighlight={t("features.anywhereInTheWorld")}
        description={t("features.globalPaymentsFullDesc")}
        features={[
          { icon: Send, title: t("features.instantCrossBorder") },
          { icon: Wallet, title: t("features.multiCurrencyAccounts") },
          { icon: BarChart3, title: t("features.competitiveRates") },
        ]}
      >
        <div>
          <div className="rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40 group">
            <video
              src="/global-payments.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[360px] md:h-[420px] object-cover scale-[1.12] transition-transform duration-700 group-hover:scale-[1.15]"
            />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#36D399]/15">
              <Globe className="h-5 w-5 text-[#36D399]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t("features.fiftyPlusCountries")}</p>
              <p className="text-xs text-[var(--text-secondary)]">{t("features.sendMoneyWorldwide")}</p>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      {/* Showcase 2: Crypto Integration */}
      <ShowcaseSection
        label={t("features.cryptoIntegration")}
        labelIcon={Bitcoin}
        title={t("features.traditionalDigital")}
        titleHighlight={t("features.oneWallet")}
        titleHighlightGold
        description={t("features.cryptoFullDesc")}
        reverse
        features={[
          { icon: BarChart3, title: t("features.realTimeCryptoPortfolio"), gold: true },
          { icon: ArrowRight, title: t("features.buySellHold"), gold: true },
          { icon: ShieldCheck, title: t("features.secureColdStorage"), gold: true },
        ]}
      >
        <div>
          <div className="rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40 group">
            <video
              src="/crypto-integration.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[360px] md:h-[420px] object-cover scale-[1.12] transition-transform duration-700 group-hover:scale-[1.15]"
            />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <Bitcoin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t("features.cryptoEnabled")}</p>
              <p className="text-xs text-[var(--text-secondary)]">{t("features.btcEthMore")}</p>
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
                {t("features.cardsWallet")}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-5">
                {t("features.virtualPhysical")}{" "}
                <span className="web3-gradient-text">
                  {t("features.cardsForEveryNeed")}
                </span>
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                {t("features.cardsDesc")}
              </p>
            </div>

            {/* Two cards side by side */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pb-12">
              {/* Flip Card */}
              <div className="flex flex-col items-center">
                <CardsDisplay />
                <p className="text-xs text-[var(--text-tertiary)] mt-4 italic">{t("features.hoverToFlip")}</p>
              </div>

              {/* Wallet */}
              <div className="flex flex-col items-center">
                <WalletCards />
              </div>
            </div>

            {/* Features row below */}
            <div className="grid sm:grid-cols-3 gap-4 pb-20 md:pb-28">
              {[
                { icon: ArrowRight, titleKey: "features.instantVirtualCard", descKey: "features.generateNewCard" },
                { icon: Globe, titleKey: "features.spendAnyCurrency", descKey: "features.automaticConversion" },
                { icon: ShieldCheck, titleKey: "features.freezeUnfreeze", descKey: "features.fullControl" },
              ].map((feat) => (
                <motion.div
                  key={feat.titleKey}
                  whileHover={{ y: -3 }}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[#36D399]/15 hover:bg-[#36D399]/[0.03] transition-all duration-300"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#36D399]/10">
                    <feat.icon className="h-[18px] w-[18px] text-[#36D399]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{t(feat.titleKey)}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t(feat.descKey)}</p>
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
        label={t("features.forBusiness")}
        labelIcon={Building2}
        title={t("features.financialInfrastructure")}
        titleHighlight={t("features.modernBusiness")}
        titleHighlightGold
        description={t("features.businessFullDesc")}
        reverse
        features={[
          { icon: ArrowRight, title: t("features.globalPayouts"), gold: true },
          { icon: Building2, title: t("features.secureApi"), gold: true },
          { icon: Bitcoin, title: t("features.acceptCrypto"), gold: true },
        ]}
      >
        <div>
          <div className="rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40 group">
            <video
              src="/business-infrastructure.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[360px] md:h-[420px] object-cover scale-[1.12] transition-transform duration-700 group-hover:scale-[1.15]"
            />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <Building2 className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t("features.apiReady")}</p>
              <p className="text-xs text-[var(--text-secondary)]">{t("features.seamlessIntegration")}</p>
            </div>
          </div>
        </div>
      </ShowcaseSection>
    </>
  );
}
