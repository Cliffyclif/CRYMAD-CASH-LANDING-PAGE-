"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage, LOCALES, getFlagUrl } from "@/i18n/LanguageContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-2 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 backdrop-blur-sm transition-all duration-200"
        aria-label="Change language"
      >
        <img
          src={getFlagUrl(current.country)}
          alt=""
          width={20}
          height={15}
          className="rounded-sm object-cover"
          style={{ width: 20, height: 15 }}
        />
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 max-h-80 overflow-y-auto rounded-xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] backdrop-blur-xl shadow-2xl z-50"
          >
            <div className="p-1.5">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${
                    locale === l.code
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <img
                    src={getFlagUrl(l.country)}
                    alt={l.label}
                    width={20}
                    height={15}
                    className="rounded-sm object-cover"
                    style={{ width: 20, height: 15 }}
                  />
                  <span>{l.label}</span>
                  {locale === l.code && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
