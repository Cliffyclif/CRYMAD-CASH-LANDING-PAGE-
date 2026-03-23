"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Image from "next/image";
import { useLanguage, useTranslatedArray } from "@/i18n/LanguageContext";

export function Accounts() {
  const { t } = useLanguage();
  const personalFeatures = useTranslatedArray("accounts.personalFeatures");
  const businessFeatures = useTranslatedArray("accounts.businessFeatures");

  return (
    <section id="personal" className="relative py-24 md:py-32 bg-gradient-to-b from-[var(--background)] to-[var(--section-alt)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
            {t("accounts.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("accounts.title")}{" "}
            <span className="web3-gradient-text">
              {t("accounts.titleHighlight")}
            </span>
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] leading-relaxed">
            {t("accounts.description")}
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Account */}
          <AnimatedSection delay={0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-all duration-400 hover:border-[#36D399]/20"
            >
              <div className="relative h-[280px] overflow-hidden rounded-t-3xl">
                <Image
                  src="/personal-account.jpg"
                  alt="Personal mobile banking and digital payments"
                  width={600}
                  height={280}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#36D399] bg-[#36D399]/10 border border-[#36D399]/15 px-3.5 py-1.5 rounded-full mb-4">
                  {t("accounts.personal")}
                </span>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{t("accounts.individualAccount")}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {t("accounts.personalDesc")}
                </p>
                <div className="flex flex-col gap-3">
                  {personalFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-4 w-4 text-[#36D399] shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Business Account */}
          <AnimatedSection delay={0.2}>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-all duration-400 hover:border-amber-400/20"
            >
              <div className="relative h-[280px] overflow-hidden rounded-t-3xl">
                <Image
                  src="/business-account.jpg"
                  alt="Business team collaborating on global operations"
                  width={600}
                  height={280}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-amber-400 bg-amber-400/10 border border-amber-400/15 px-3.5 py-1.5 rounded-full mb-4">
                  {t("accounts.business")}
                </span>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{t("accounts.businessAccount")}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {t("accounts.businessDesc")}
                </p>
                <div className="flex flex-col gap-3">
                  {businessFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
