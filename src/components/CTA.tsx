"use client";

import { ArrowRight, Mail } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

export function CTA() {
  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/90 to-[var(--background)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#36D399]/30 bg-[#36D399]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#36D399] mb-6">
            <ArrowRight className="h-3.5 w-3.5" />
            Get Started
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Ready to Join the{" "}
            <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
              Future of Finance
            </span>
            ?
          </h2>

          <p className="mt-5 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Open your Crymad Cash account today and experience borderless, digital-first financial services.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://production-crmdx.web.app/sign-up"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[var(--primary)] px-8 py-3.5 text-[15px] font-bold text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200 gap-2 shadow-lg shadow-[var(--primary)]/25"
            >
              Open Personal Account
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact-business"
              className="w-full sm:w-auto inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm px-8 py-3.5 text-[15px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all duration-200"
            >
              Business Solutions
            </a>
          </div>

          {/* Contact emails */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-10 border-t border-[var(--glass-border)]">
            <div className="flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
              <Mail className="h-4 w-4 text-[#36D399]" />
              support@crymadcash.com
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
              <Mail className="h-4 w-4 text-[#36D399]" />
              compliance@crymadcash.com
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
