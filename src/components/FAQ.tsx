"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Image from "next/image";

const faqs = [
  {
    question: "Is Crymad Cash a bank?",
    answer:
      "Crymad Cash is a financial technology platform that provides access to digital financial services through licensed financial partners. We are not a bank, but we work with regulated financial institutions to provide secure and compliant banking-like services.",
  },
  {
    question: "Who can open an account?",
    answer:
      "Both individuals and businesses can open Crymad Cash accounts subject to identity verification and compliance checks. We support customers from over 150 countries worldwide.",
  },
  {
    question: "What currencies are supported?",
    answer:
      "Crymad Cash supports 100+ fiat currencies including USD, EUR, GBP, and more, as well as popular cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and USD Coin (USDC).",
  },
  {
    question: "Are my funds secure?",
    answer:
      "Yes. Crymad Cash uses AES-256 encryption, multi-factor authentication, and real-time transaction monitoring to protect your account. We comply with international financial standards and employ advanced fraud detection systems.",
  },
  {
    question: "Can I send international payments?",
    answer:
      "Absolutely. Crymad Cash enables global transfers and cross-border payments to 150+ countries with competitive exchange rates and fast processing times across all supported currencies.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatedSection delay={index * 0.08}>
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
    </AnimatedSection>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32 bg-gradient-to-b from-[var(--background)] to-[var(--section-alt)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Sidebar Image */}
          <AnimatedSection className="hidden lg:block sticky top-24">
            <div className="rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl shadow-black/40">
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80"
                alt="Customer support"
                width={600}
                height={500}
                className="w-full h-[500px] object-cover"
              />
            </div>
          </AnimatedSection>

          {/* FAQ List */}
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <FAQItem key={faq.question} {...faq} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
