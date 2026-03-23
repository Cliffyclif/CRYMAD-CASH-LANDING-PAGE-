"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Shield, Wallet, CreditCard, ArrowLeftRight, Bitcoin } from "lucide-react";
import { Globe3D } from "./Globe3D";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Floating transaction notifications ───────────────────── */
const NOTIFICATIONS = [
  { from: "New York", to: "London", amount: "$12,450", type: "Transfer", icon: ArrowLeftRight, flag1: "\u{1F1FA}\u{1F1F8}", flag2: "\u{1F1EC}\u{1F1E7}" },
  { from: "Lagos", to: "Dubai", amount: "\u20A62.5M", type: "Payment", icon: Wallet, flag1: "\u{1F1F3}\u{1F1EC}", flag2: "\u{1F1E6}\u{1F1EA}" },
  { from: "Singapore", to: "Tokyo", amount: "\u00A5850K", type: "Crypto", icon: Bitcoin, flag1: "\u{1F1F8}\u{1F1EC}", flag2: "\u{1F1EF}\u{1F1F5}" },
  { from: "S\u00E3o Paulo", to: "Berlin", amount: "\u20AC8,200", type: "Card", icon: CreditCard, flag1: "\u{1F1E7}\u{1F1F7}", flag2: "\u{1F1E9}\u{1F1EA}" },
  { from: "Mumbai", to: "Toronto", amount: "C$5,600", type: "Transfer", icon: ArrowLeftRight, flag1: "\u{1F1EE}\u{1F1F3}", flag2: "\u{1F1E8}\u{1F1E6}" },
  { from: "Nairobi", to: "Sydney", amount: "A$3,100", type: "Payment", icon: Wallet, flag1: "\u{1F1F0}\u{1F1EA}", flag2: "\u{1F1E6}\u{1F1FA}" },
];

function FloatingNotification({
  notification,
  position,
  delay,
}: {
  notification: (typeof NOTIFICATIONS)[number];
  position: "left" | "right";
  delay: number;
}) {
  const Icon = notification.icon;
  const isLeft = position === "left";

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${isLeft ? "left-4 xl:left-8" : "right-4 xl:right-8"} pointer-events-none`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/20" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/20">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <span>{notification.flag1}</span>
            <span>{notification.from}</span>
            <ArrowRight className="h-3 w-3 text-[var(--primary)]/60" />
            <span>{notification.flag2}</span>
            <span>{notification.to}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[14px] font-semibold text-[var(--text-primary)] tabular-nums">
              {notification.amount}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--primary)] px-1.5 py-0.5 rounded bg-[var(--primary)]/10">
              {notification.type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Cycling transaction feed ─────────────────────────────── */
function TransactionFeed({ side }: { side: "left" | "right" }) {
  const [index, setIndex] = useState(side === "left" ? 0 : 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
      >
        <FloatingNotification
          notification={NOTIFICATIONS[index]}
          position={side}
          delay={0}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Stat counter ─────────────────────────────────────────── */
function StatPill({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      <span className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tabular-nums">
        {value}
      </span>
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--text-tertiary)] mt-1">
        {label}
      </span>
    </motion.div>
  );
}

/* ── Hero Section ─────────────────────────────────────────── */
export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative overflow-hidden bg-[var(--background)]"
    >
      {/* Web3 Background layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Primary neon glow - top center */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, var(--primary) 0%, transparent 60%)",
            filter: "blur(100px)",
          }}
        />
        {/* Cyan accent - right */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, var(--neon-cyan) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        {/* Purple accent - left bottom */}
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] left-[5%] w-[600px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse, var(--neon-purple) 0%, transparent 60%)",
            filter: "blur(100px)",
          }}
        />
        {/* Cyber grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--neon-cyan) 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Navbar spacer */}
      <div className="h-16 lg:h-[72px]" />

      {/* Main content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-4 items-center">
          {/* ── Left: Text content ── */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-1.5 mb-6 backdrop-blur-sm neon-border">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" style={{ boxShadow: "0 0 8px var(--primary)" }} />
                <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
                  {t("hero.badge")}
                </span>
              </div>

              <h1 className="text-[2.75rem] leading-[1.05] font-bold text-[var(--text-primary)] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] tracking-tight">
                {t("hero.title")}
                <br />
                <span className="web3-gradient-text">
                  {t("hero.subtitle")}
                </span>
              </h1>

              <p className="mt-6 text-[16px] sm:text-[17px] leading-relaxed text-[var(--text-secondary)] max-w-lg mx-auto lg:mx-0">
                {t("hero.description")}
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center">
                <motion.a
                  href="https://production-crmdx.web.app/sign-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0,232,157,0.3), 0 0 60px rgba(0,232,157,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[var(--primary)] px-8 py-3.5 text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300 gap-2 shadow-[0_0_20px_rgba(0,232,157,0.2),0_0_40px_rgba(0,232,157,0.1)]"
                >
                  {t("hero.openAccount")}
                  <ArrowRight className="h-4 w-4" />
                </motion.a>
                <motion.a
                  href="#business"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md px-8 py-3.5 text-[15px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.08)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300 gap-2 gradient-border"
                >
                  {t("hero.businessSolutions")}
                  <ArrowUpRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                </motion.a>
              </div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start text-[12px] text-[var(--text-tertiary)]"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[var(--primary)]/50" />
                  <span>{t("hero.bankGradeEncryption")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-[var(--primary)]/50" />
                  <span>{t("hero.physicalVirtualCards")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bitcoin className="h-3.5 w-3.5 text-[var(--primary)]/50" />
                  <span>{t("hero.cryptoIntegration")}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Right: 3D Globe ── */}
          <div className="relative h-[350px] sm:h-[420px] lg:h-[500px] xl:h-[540px]">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle, var(--primary) 0%, var(--neon-cyan) 40%, transparent 65%)",
                filter: "blur(60px)",
              }}
              aria-hidden="true"
            />

            <Globe3D />

            <div className="hidden xl:block absolute top-[15%] left-0 right-0 h-0">
              <TransactionFeed side="right" />
            </div>
            <div className="hidden xl:block absolute bottom-[25%] left-0 right-0 h-0">
              <TransactionFeed side="left" />
            </div>
          </div>
        </div>

        {/* ── Bottom stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="relative z-10 mt-0 mb-4"
        >
          <div className="flex items-center justify-center lg:justify-start">
            <div className="grid grid-cols-3 gap-8 sm:gap-16 py-8 border-t border-[var(--glass-border)]">
              <StatPill label={t("hero.countries")} value="50+" delay={1.1} />
              <StatPill label={t("hero.currencies")} value="10+" delay={1.2} />
              <StatPill label={t("hero.support")} value="24/7" delay={1.3} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(transparent, var(--background))",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
