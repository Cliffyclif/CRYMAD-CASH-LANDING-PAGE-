"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, getFlagUrl, useLanguage } from "@/i18n/LanguageContext";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: compact ? "6px 10px" : "8px 14px",
          borderRadius: 999,
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          color: "var(--text)",
          cursor: "pointer",
          fontSize: compact ? 11 : 12,
          fontWeight: 600,
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFlagUrl(current.country)}
          alt=""
          width={18}
          height={12}
          style={{ borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
        />
        <span>{compact ? current.code.toUpperCase() : current.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            maxHeight: 360,
            overflowY: "auto",
            background: "var(--bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: 14,
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.35)",
            padding: 6,
            zIndex: 100,
          }}
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLocale(l.code); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: active ? "rgba(var(--primary-rgb), 0.12)" : "transparent",
                  border: "none",
                  color: active ? "var(--primary)" : "var(--text)",
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFlagUrl(l.country)}
                  alt=""
                  width={22}
                  height={15}
                  style={{ borderRadius: 3, objectFit: "cover", flexShrink: 0 }}
                />
                <span style={{ flex: 1 }}>{l.label}</span>
                {active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
