"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Image from "next/image";

const personalFeatures = [
  "Multi-currency accounts in 100+ currencies",
  "Secure digital e-wallet",
  "Global transfers to 150+ countries",
  "Crypto integration (BTC, ETH, USDT, USDC)",
  "Virtual & physical debit cards",
];

const businessFeatures = [
  "Global payouts to vendors & partners",
  "Multi-currency business accounts",
  "Secure API payment integration",
  "Accept crypto payments",
  "Team management & permissions",
];

export function Accounts() {
  return (
    <section id="personal" className="relative py-24 md:py-32 bg-gradient-to-b from-[var(--background)] to-[var(--section-alt)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
            Account Types
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
              Account
            </span>
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] leading-relaxed">
            Whether you&apos;re an individual or a business, Crymad Cash has the right tools for you.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Account */}
          <AnimatedSection delay={0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-all duration-400 hover:border-[#36D399]/20"
            >
              <div className="relative h-[220px] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80"
                  alt="Personal mobile banking and digital payments"
                  width={600}
                  height={220}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]/95" />
              </div>
              <div className="relative -mt-10 z-10 p-8">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#36D399] bg-[#36D399]/10 border border-[#36D399]/15 px-3.5 py-1.5 rounded-full mb-4">
                  Personal
                </span>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Individual Account</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  For individuals who want fast, flexible, and global financial access with all the tools you need.
                </p>
                <div className="flex flex-col gap-3">
                  {personalFeatures.map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
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
              <div className="relative h-[220px] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80"
                  alt="Business team collaborating on global operations"
                  width={600}
                  height={220}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]/95" />
              </div>
              <div className="relative -mt-10 z-10 p-8">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-amber-400 bg-amber-400/10 border border-amber-400/15 px-3.5 py-1.5 rounded-full mb-4">
                  Business
                </span>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Business Account</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  Powerful financial tools designed for global operations and growing companies.
                </p>
                <div className="flex flex-col gap-3">
                  {businessFeatures.map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
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
