"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Supported locales
export const LOCALES = [
  { code: "en", label: "English", country: "gb" },
  { code: "fr", label: "Français", country: "fr" },
  { code: "nl", label: "Nederlands", country: "nl" },
  { code: "de", label: "Deutsch", country: "de" },
  { code: "es", label: "Español", country: "es" },
  { code: "pt", label: "Português", country: "pt" },
  { code: "ar", label: "العربية", country: "sa" },
  { code: "zh", label: "中文", country: "cn" },
  { code: "ja", label: "日本語", country: "jp" },
  { code: "ko", label: "한국어", country: "kr" },
  { code: "it", label: "Italiano", country: "it" },
  { code: "ru", label: "Русский", country: "ru" },
  { code: "tr", label: "Türkçe", country: "tr" },
  { code: "hi", label: "हिन्दी", country: "in" },
] as const;

export function getFlagUrl(country: string) {
  return `https://flagcdn.com/w40/${country}.png`;
}

export type LocaleCode = (typeof LOCALES)[number]["code"];

type Translations = Record<string, unknown>;

interface LanguageContextType {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  translations: Translations;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Cache loaded translations
const translationCache: Partial<Record<LocaleCode, Translations>> = {};

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = useCallback(async (code: LocaleCode) => {
    if (translationCache[code]) {
      setTranslations(translationCache[code]!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const mod = await import(`./translations/${code}.json`);
      const data = mod.default || mod;
      translationCache[code] = data;
      setTranslations(data);
    } catch {
      // Fallback to English
      if (code !== "en") {
        const mod = await import("./translations/en.json");
        const data = mod.default || mod;
        translationCache["en"] = data;
        setTranslations(data);
      }
    }
    setIsLoading(false);
  }, []);

  // Load initial locale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("crymad-locale") as LocaleCode | null;
    const initial = saved && LOCALES.some((l) => l.code === saved) ? saved : "en";
    setLocaleState(initial);
    loadTranslations(initial);
  }, [loadTranslations]);

  const setLocale = useCallback(
    (code: LocaleCode) => {
      setLocaleState(code);
      localStorage.setItem("crymad-locale", code);
      loadTranslations(code);
      // Set HTML dir for RTL languages
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = code;
    },
    [loadTranslations]
  );

  const t = useCallback(
    (key: string, replacements?: Record<string, string>): string => {
      const value = getNestedValue(translations, key);
      if (typeof value === "string") {
        if (!replacements) return value;
        return Object.entries(replacements).reduce(
          (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), v),
          value
        );
      }
      // For arrays/objects, return the value as-is won't work — return key as fallback
      if (value !== undefined) return value as string;
      // Fallback: try English cache
      const enValue = getNestedValue(translationCache["en"], key);
      if (typeof enValue === "string") return enValue;
      return key;
    },
    [translations]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, translations, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

// Helper to get array translations
export function useTranslatedArray(key: string): string[] {
  const { translations } = useLanguage();
  const value = getNestedValue(translations, key);
  if (Array.isArray(value)) return value as string[];
  return [];
}

// Helper for FAQ-style array of objects
export function useTranslatedItems<T>(key: string): T[] {
  const { translations } = useLanguage();
  const value = getNestedValue(translations, key);
  if (Array.isArray(value)) return value as T[];
  return [];
}

