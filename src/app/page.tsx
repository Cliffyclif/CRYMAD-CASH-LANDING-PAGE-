"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Accounts } from "@/components/Accounts";
import { GlassFeatures } from "@/components/GlassFeatures";
import { Security } from "@/components/Security";
import { About } from "@/components/About";
import { FAQ } from "@/components/FAQ";
import { MobileApp } from "@/components/MobileApp";
import { CTA } from "@/components/CTA";
import { TickerBar } from "@/components/TickerBar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";

type ContactChannel = "support" | "business" | "compliance";

const BUSINESS_KEYWORDS = [
  "#business",
  "#contact-business",
  "business solutions",
  "business accounts",
  "global payments",
  "crypto integration",
  "partnership",
];

const COMPLIANCE_KEYWORDS = [
  "#contact-compliance",
  "aml policy",
  "terms of service",
  "privacy policy",
  "risk disclosure",
  "partner disclosures",
];

function resolveChannel(anchor: HTMLAnchorElement): ContactChannel | null {
  const href = (anchor.getAttribute("href") || "").toLowerCase();
  const text = (anchor.textContent || "").toLowerCase().trim();

  // Explicit channel hrefs
  if (href === "#contact-business") return "business";
  if (href === "#contact-compliance") return "compliance";
  if (href === "#contact") return "support";

  // Match by link text
  if (COMPLIANCE_KEYWORDS.some((kw) => text.includes(kw))) return "compliance";
  if (BUSINESS_KEYWORDS.some((kw) => text.includes(kw))) return "business";

  return null;
}

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactChannel, setContactChannel] = useState<ContactChannel>("support");

  // Intercept contact link clicks to open the appropriate modal variant
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const channel = resolveChannel(anchor);
      if (channel) {
        e.preventDefault();
        setContactChannel(channel);
        setContactOpen(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TickerBar />
        <GlassFeatures />
        <Features />
        <Accounts />
        <Security />
        <About />
        <FAQ />
        <MobileApp />
        <CTA />
      </main>
      <Footer />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} channel={contactChannel} />
    </>
  );
}
