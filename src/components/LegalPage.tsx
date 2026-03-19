"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import Link from "next/link";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const legalNav = [
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "AML Policy", href: "/legal/aml-policy" },
  { label: "Risk Disclosure", href: "/legal/risk-disclosure" },
  { label: "Partner Disclosures", href: "/legal/partner-disclosures" },
];

interface LegalPageProps {
  title: string;
  subtitle: string;
  effectiveDate: string;
  children: React.ReactNode;
}

export function LegalPage({ title, subtitle, effectiveDate, children }: LegalPageProps) {
  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--section-alt)] to-[var(--background)]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-5">
                <Scale className="h-3.5 w-3.5 text-[#36D399]" />
                Legal
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                {title}
              </h1>
              <p className="mt-3 text-[var(--text-secondary)]">{subtitle}</p>
              <p className="mt-2 text-sm text-[var(--text-tertiary)]">
                Effective Date: {effectiveDate}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[220px_1fr] gap-10">
              {/* Sidebar nav */}
              <motion.nav
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:sticky lg:top-24 lg:self-start"
              >
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">
                  Legal Documents
                </p>
                <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {legalNav.map((item) => {
                    const isActive = typeof window !== "undefined" && window.location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`whitespace-nowrap text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#36D399]/10 text-[#36D399] border border-[#36D399]/20"
                            : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] border border-transparent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.nav>

              {/* Main content */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="legal-content prose prose-sm max-w-none
                  text-[var(--text-secondary)]
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[var(--glass-border)]
                  [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-6 [&_h3]:mb-3
                  [&_p]:leading-relaxed [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-2
                  [&_li]:leading-relaxed
                  [&_strong]:text-[var(--text-primary)] [&_strong]:font-semibold
                  [&_a]:text-[#36D399] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:brightness-110
                  [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6
                  [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-[var(--text-primary)] [&_th]:p-3 [&_th]:border-b [&_th]:border-[var(--glass-border)] [&_th]:bg-[var(--glass-bg)]
                  [&_td]:text-sm [&_td]:p-3 [&_td]:border-b [&_td]:border-[var(--glass-border)]
                "
              >
                {children}
              </motion.article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
