"use client";

import { motion } from "framer-motion";
import { Target, Zap, Globe, Shield } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";

const valueIcons = [Target, Zap, Globe, Shield];
const valueKeys = [
  { titleKey: "about.ourMission", descKey: "about.ourMissionDesc" },
  { titleKey: "about.innovation", descKey: "about.innovationDesc" },
  { titleKey: "about.globalReach", descKey: "about.globalReachDesc" },
  { titleKey: "about.compliance", descKey: "about.complianceDesc" },
];

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="relative py-24 md:py-32 bg-surface" aria-labelledby="about-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <AnimatedSection>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl blur-2xl" aria-hidden="true" />
              <div className="relative bg-surface-elevated border border-border rounded-3xl p-8 md:p-12">
                <div className="flex justify-center mb-8">
                  <Image
                    src="https://res.cloudinary.com/dxvi5d6dr/image/upload/v1766762874/photo_2025-12-24_18.04.43-removebg-preview_ck9wyx.png"
                    alt="Crymad Cash"
                    width={120}
                    height={120}
                    className="h-24 w-24 md:h-28 md:w-28 object-contain"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { value: t("about.countriesStat"), label: t("about.countriesLabel") },
                    { value: t("about.supportStat"), label: t("about.supportLabel") },
                    { value: t("about.digitalStat"), label: t("about.digitalLabel") },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                      className="p-4"
                    >
                      <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative gold line */}
                <div className="mt-8 h-1 w-full rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-40" aria-hidden="true" />
              </div>
            </div>
          </AnimatedSection>

          {/* Content */}
          <AnimatedSection delay={0.2}>
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-4">
              {t("about.badge")}
            </span>
            <h2 id="about-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t("about.title")}{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("about.titleHighlight")}
              </span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("about.description")}
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("about.description2")}
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {valueKeys.map((item, index) => {
                const Icon = valueIcons[index];
                return (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{t(item.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t(item.descKey)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
