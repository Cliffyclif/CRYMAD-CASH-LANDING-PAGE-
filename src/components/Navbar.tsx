"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

const NAV_KEYS = [
  { key: "nav.home", href: "/" },
  { key: "nav.security", href: "/security" },
  { key: "nav.faq", href: "/faq" },
  { key: "nav.contact", href: "/contact" },
  { key: "nav.about", href: "/about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--nav-scrolled)] backdrop-blur-xl shadow-[0_1px_0_var(--glass-border),0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
      style={scrolled ? {
        borderBottom: "1px solid transparent",
        borderImage: "linear-gradient(90deg, transparent, var(--neon-cyan), var(--primary), var(--neon-purple), transparent) 1",
      } : undefined}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-lg"
            aria-label="Crymad Cash home"
          >
            <Image
              src="https://res.cloudinary.com/dxvi5d6dr/image/upload/v1766762874/photo_2025-12-24_18.04.43-removebg-preview_ck9wyx.png"
              alt="Crymad Cash logo"
              width={40}
              height={40}
              className="h-9 w-9 lg:h-10 lg:w-10 object-contain"
              priority
            />
            <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)] lg:text-base">
              CRYMAD CASH
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_KEYS.map((link) => {
              const label = t(link.key);
              const cls = "px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--glass-bg)] transition-colors duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
              const isExternal = link.href.startsWith("http");
              if (isExternal) {
                return <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>;
              }
              if (link.href.startsWith("/")) {
                return <Link key={link.key} href={link.href} className={cls}>{label}</Link>;
              }
              return <a key={link.key} href={link.href} className={cls}>{label}</a>;
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <a
              href="https://app.crymadcash.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200"
            >
              {t("nav.signIn")}
            </a>
            <a
              href="https://app.crymadcash.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2 text-[13px] font-bold text-white hover:brightness-110 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300 shadow-[0_0_15px_rgba(0,232,157,0.2)]"
            >
              {t("nav.openAccount")}
            </a>
          </div>

          {/* Mobile actions */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[var(--glass-border)] bg-[var(--background)]/98 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-0.5">
              {NAV_KEYS.map((link) => {
                const label = t(link.key);
                const cls = "block min-h-[44px] px-3 py-3 text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
                const isExternal = link.href.startsWith("http");
                if (isExternal) {
                  return <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setMobileOpen(false)} className={cls}>{label}</a>;
                }
                if (link.href.startsWith("/")) {
                  return <Link key={link.key} href={link.href} role="menuitem" onClick={() => setMobileOpen(false)} className={cls}>{label}</Link>;
                }
                return <a key={link.key} href={link.href} role="menuitem" onClick={() => setMobileOpen(false)} className={cls}>{label}</a>;
              })}
              <div className="pt-3 mt-2 border-t border-[var(--glass-border)] flex flex-col gap-2">
                <a
                  href="https://app.crymadcash.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block min-h-[44px] text-center px-4 py-3 border border-[var(--glass-border)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {t("nav.signIn")}
                </a>
                <a
                  href="https://app.crymadcash.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block min-h-[44px] text-center px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:brightness-110 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {t("nav.openAccount")}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
