"use client";

import { ArrowRight, Mail } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { useLanguage } from "@/i18n/LanguageContext";

export function CTA() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Web3 mesh background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, var(--primary) 0%, transparent 50%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, var(--neon-cyan) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, var(--neon-purple) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        {/* Cyber grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary)] mb-6 backdrop-blur-sm neon-border">
            <ArrowRight className="h-3.5 w-3.5" />
            {t("cta.badge")}
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("cta.title")}{" "}
            <span className="web3-gradient-text">
              {t("cta.titleHighlight")}
            </span>
            ?
          </h2>

          <p className="mt-5 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            {t("cta.description")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.crymadcash.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[var(--primary)] px-8 py-3.5 text-[15px] font-bold text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300 gap-2 shadow-[0_0_20px_rgba(0,232,157,0.2),0_0_40px_rgba(0,232,157,0.1)] hover:shadow-[0_0_30px_rgba(0,232,157,0.3),0_0_60px_rgba(0,232,157,0.15)]"
            >
              {t("cta.openPersonalAccount")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact-business"
              className="w-full sm:w-auto inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md px-8 py-3.5 text-[15px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.08)] transition-all duration-300 gradient-border"
            >
              {t("cta.businessSolutions")}
            </a>
          </div>

          {/* Contact emails */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-10 border-t border-[var(--glass-border)]">
            <div className="flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
              <Mail className="h-4 w-4 text-[var(--primary)]" style={{ filter: "drop-shadow(0 0 4px var(--primary))" }} />
              support@crymadcash.com
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
              <Mail className="h-4 w-4 text-[var(--primary)]" style={{ filter: "drop-shadow(0 0 4px var(--primary))" }} />
              compliance@crymadcash.com
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
