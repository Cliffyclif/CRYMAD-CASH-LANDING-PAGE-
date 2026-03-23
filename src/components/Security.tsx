"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { useLanguage, useTranslatedArray } from "@/i18n/LanguageContext";

export function Security() {
  const { t } = useLanguage();
  const securityItems = useTranslatedArray("security.items");

  return (
    <section id="security" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(0,232,157,0.06), rgba(0,240,255,0.03), transparent 60%)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Video */}
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[400px] md:h-[450px] object-cover"
              >
                <source src="/security-bg.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)]/30 to-amber-500/5 pointer-events-none" />
            </div>
          </AnimatedSection>

          {/* Content */}
          <div>
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-amber-400 mb-5">
                {t("security.badge")}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-5">
                {t("security.title")}{" "}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  {t("security.titleHighlight")}
                </span>
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg">
                {t("security.description")}
              </p>
            </AnimatedSection>

            <div className="flex flex-col gap-3">
              {securityItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-amber-400/20 hover:bg-amber-400/[0.03] transition-all duration-300"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                    <Check className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-[15px] font-medium text-[var(--text-primary)]">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
