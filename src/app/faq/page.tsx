"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Search, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

interface FAQCategory {
  name: string;
  questions: { question: string; answer: string }[];
}

const faqCategories: FAQCategory[] = [
  {
    name: "General",
    questions: [
      {
        question: "Is Crymad Cash a bank?",
        answer:
          "Crymad Cash is a financial technology platform that provides access to digital financial services through licensed financial partners. We are not a bank, but we work with regulated financial institutions to provide secure and compliant banking-like services.",
      },
      {
        question: "Who can open an account?",
        answer:
          "Both individuals and businesses can open Crymad Cash accounts subject to identity verification and compliance checks. We support customers from over 50 countries worldwide.",
      },
      {
        question: "How do I get started?",
        answer:
          "Getting started is simple. Visit our sign-up page, provide your personal or business details, complete identity verification (KYC), and your account will be ready to use within minutes. No minimum deposit is required to open an account.",
      },
      {
        question: "Is there a mobile app?",
        answer:
          "Yes. Crymad Cash is available on both iOS and Android. You can download it from the App Store or Google Play, or access your account through our web platform from any browser.",
      },
    ],
  },
  {
    name: "Accounts & Verification",
    questions: [
      {
        question: "What documents do I need to verify my account?",
        answer:
          "For personal accounts, you'll need a government-issued photo ID (passport, national ID, or driver's license) and a proof of address (utility bill or bank statement from the last 3 months). Business accounts require additional documentation such as certificate of incorporation and proof of company address.",
      },
      {
        question: "How long does verification take?",
        answer:
          "Most verifications are completed within 24 hours. In some cases, additional review may be required, which can take up to 3 business days. You'll receive email updates throughout the process.",
      },
      {
        question: "Can I have both a personal and business account?",
        answer:
          "Yes. You can maintain separate personal and business accounts under the same email address. Each account is managed independently with its own balances, cards, and transaction history.",
      },
      {
        question: "What are the account limits?",
        answer:
          "Account limits depend on your verification level and account type. Fully verified personal accounts have generous daily and monthly transaction limits. Business accounts offer higher limits tailored to your company's needs. Contact our sales team for custom enterprise limits.",
      },
    ],
  },
  {
    name: "Currencies & Payments",
    questions: [
      {
        question: "What currencies are supported?",
        answer:
          "Crymad Cash supports 100+ fiat currencies including USD, EUR, GBP, and more, as well as popular cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and USD Coin (USDC).",
      },
      {
        question: "Can I send international payments?",
        answer:
          "Absolutely. Crymad Cash enables global transfers and cross-border payments to 50+ countries with competitive exchange rates and fast processing times across all supported currencies.",
      },
      {
        question: "What are the fees for currency conversion?",
        answer:
          "We offer competitive exchange rates with transparent fees. There are no hidden charges — you'll always see the exact rate and fee before confirming any conversion. Business accounts benefit from preferential rates on high-volume conversions.",
      },
      {
        question: "How fast are international transfers?",
        answer:
          "Transfer speeds vary by destination and currency. Many transfers are completed within minutes using our instant payment rails. SWIFT transfers typically take 1-3 business days. Crypto transfers are processed within the standard blockchain confirmation times.",
      },
    ],
  },
  {
    name: "Security",
    questions: [
      {
        question: "Are my funds secure?",
        answer:
          "Yes. Crymad Cash uses AES-256 encryption, multi-factor authentication, and real-time transaction monitoring to protect your account. We comply with international financial standards and employ advanced fraud detection systems.",
      },
      {
        question: "What happens if I lose access to my account?",
        answer:
          "If you lose access, you can reset your password through our secure recovery process. For additional security, our support team can help verify your identity and restore access. We recommend enabling two-factor authentication to add an extra layer of protection.",
      },
      {
        question: "Does Crymad Cash share my data?",
        answer:
          "We take your privacy seriously. Your personal data is never sold to third parties. We only share information when required by law or regulation, or with our licensed financial partners to provide our services. See our Privacy Policy for full details.",
      },
    ],
  },
  {
    name: "Cards & Spending",
    questions: [
      {
        question: "Does Crymad Cash offer debit cards?",
        answer:
          "Yes. Crymad Cash offers both virtual and physical debit cards linked to your account. You can use them for online purchases, in-store payments, and ATM withdrawals worldwide wherever Visa or Mastercard is accepted.",
      },
      {
        question: "Can I freeze or block my card?",
        answer:
          "You can instantly freeze or unfreeze your card from the app at any time. If your card is lost or stolen, you can permanently block it and request a replacement — all from your dashboard.",
      },
    ],
  },
  {
    name: "Crypto",
    questions: [
      {
        question: "Can I buy and sell crypto on Crymad Cash?",
        answer:
          "Yes. You can buy, sell, and hold popular cryptocurrencies directly from your Crymad Cash account. We support Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), and more.",
      },
      {
        question: "Can I convert crypto to fiat and vice versa?",
        answer:
          "Yes. Seamlessly convert between crypto and fiat currencies within your account. Converted funds are available immediately in your chosen currency wallet.",
      },
    ],
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
          isOpen ? "border-[#36D399]/20 bg-[var(--glass-bg)]" : "border-[var(--glass-border)]"
        }`}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-transparent hover:bg-[var(--glass-bg)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#36D399]"
        >
          <span className="text-[15px] font-medium text-[var(--text-primary)]">{question}</span>
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isOpen ? "bg-[#36D399]/12" : "bg-[#36D399]/6"
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-[#36D399]" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

type ContactChannel = "support" | "business" | "compliance";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactChannel, setContactChannel] = useState<ContactChannel>("support");

  const openModal = (channel: ContactChannel) => {
    setContactChannel(channel);
    setContactOpen(true);
  };

  const filteredCategories = searchQuery.trim()
    ? faqCategories
        .map((cat) => ({
          ...cat,
          questions: cat.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.questions.length > 0)
    : faqCategories.filter((cat) => cat.name === activeCategory);

  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--section-alt)] to-[var(--background)]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp}>
              <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
                Help Center
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
              <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Find answers to common questions about Crymad Cash accounts, payments, security, and more.
              </p>

              {/* Search */}
              <div className="mt-8 relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] pl-12 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#36D399] focus:border-transparent transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[250px_1fr] gap-10">
              {/* Category Sidebar */}
              {!searchQuery.trim() && (
                <motion.div {...fadeUp} className="lg:sticky lg:top-24 lg:self-start">
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">
                    Categories
                  </p>
                  <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                    {faqCategories.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setActiveCategory(cat.name)}
                        className={`whitespace-nowrap text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          activeCategory === cat.name
                            ? "bg-[#36D399]/10 text-[#36D399] border border-[#36D399]/20"
                            : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] border border-transparent"
                        }`}
                      >
                        {cat.name}
                        <span className="ml-2 text-xs text-[var(--text-tertiary)]">({cat.questions.length})</span>
                      </button>
                    ))}
                  </nav>
                </motion.div>
              )}

              {/* Questions */}
              <div className={searchQuery.trim() ? "lg:col-span-2" : ""}>
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-lg text-[var(--text-secondary)]">No results found for &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-2">Try a different search term or browse categories</p>
                  </div>
                ) : (
                  filteredCategories.map((cat) => (
                    <div key={cat.name} className="mb-10 last:mb-0">
                      {searchQuery.trim() && (
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{cat.name}</h3>
                      )}
                      <div className="flex flex-col gap-3">
                        {cat.questions.map((faq, index) => (
                          <FAQItem key={faq.question} {...faq} index={index} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="py-20 md:py-28 bg-[var(--section-alt)]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Still have questions?
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)]">
                Our support team is available 24/7 to help you with anything you need.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => openModal("support")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/25"
                >
                  <Mail className="h-4 w-4" />
                  Contact Support
                </button>
                <button
                  type="button"
                  onClick={() => openModal("business")}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-8 py-3.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 transition-all"
                >
                  Talk to Sales
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} channel={contactChannel} />
    </>
  );
}
