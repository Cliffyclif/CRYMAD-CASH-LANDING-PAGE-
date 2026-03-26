"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Globe,
  Wallet,
  Shield,
  Zap,
  Mail,
  MessageSquare,
  Headphones,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage, useTranslatedArray } from "@/i18n/LanguageContext";

type ContactChannel = "support" | "business" | "compliance";
type FormStatus = "idle" | "sending" | "success" | "error";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const channels: { key: ContactChannel; icon: React.ElementType; color: string }[] = [
  { key: "support", icon: Headphones, color: "#36D399" },
  { key: "business", icon: Building2, color: "#F59E0B" },
  { key: "compliance", icon: Shield, color: "#3B82F6" },
];

export default function ContactPage() {
  const { t } = useLanguage();
  const [channel, setChannel] = useState<ContactChannel>("support");
  const subjects = useTranslatedArray(`contact.${channel}.subjects`);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, channel }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || t("contact.genericError"));
      }
    } catch {
      setStatus("error");
      setErrorMsg(t("contact.networkError"));
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--section-alt)] to-[var(--background)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#36D399]/30 bg-[#36D399]/10 text-[#36D399] px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-[0.15em]">
                <Mail className="h-3.5 w-3.5" />
                {t("contact.support.title")}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Get in{" "}
                <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                  Touch
                </span>
              </h1>
              <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                {t("contact.support.description")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="relative py-12 md:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Left sidebar */}
              <div className="lg:col-span-2">
                {/* Channel selector */}
                <motion.div {...fadeUp} className="mb-8">
                  <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                    How can we help?
                  </h3>
                  <div className="flex flex-col gap-2">
                    {channels.map((ch) => (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() => { setChannel(ch.key); setSubject(""); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          channel === ch.key
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--primary)]/30"
                        }`}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${ch.color}15` }}
                        >
                          <ch.icon className="h-4 w-4" style={{ color: ch.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {t(`contact.${ch.key}.title`)}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {t(`contact.${ch.key}.description`)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Business value props */}
                {channel === "business" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5"
                  >
                    <p className="text-xs font-semibold text-[#36D399] uppercase tracking-widest mb-4">
                      {t("contact.whyBusiness")}
                    </p>
                    <div className="flex flex-col gap-3">
                      {[
                        { icon: Globe, titleKey: "contact.countriesLabel", descKey: "contact.countriesDesc" },
                        { icon: Wallet, titleKey: "contact.multiCurrencyTitle", descKey: "contact.multiCurrencyDesc" },
                        { icon: Shield, titleKey: "contact.enterpriseSecurity", descKey: "contact.enterpriseSecurityDesc" },
                        { icon: Zap, titleKey: "contact.instantSettlement", descKey: "contact.instantSettlementDesc" },
                      ].map((item) => (
                        <div key={item.titleKey} className="flex gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#36D399]/10">
                            <item.icon className="h-3.5 w-3.5 text-[#36D399]" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{t(item.titleKey)}</p>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{t(item.descKey)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quick info */}
                <div className="mt-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-4 w-4 text-[#36D399]" />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Quick Response</p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Our team typically responds within 24 hours. For urgent matters, please indicate it in your subject line.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Email: <a href="mailto:support@crymadcash.com" className="text-[var(--primary)] hover:underline">support@crymadcash.com</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side — Form */}
              <motion.div {...fadeUp} className="lg:col-span-3">
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] p-6 md:p-8">
                  {status === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <CheckCircle className="h-14 w-14 text-[var(--primary)] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {channel === "business" ? t("contact.wellBeInTouch") : t("contact.messageSent")}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {channel === "business"
                          ? t("contact.businessSuccessMsg")
                          : t("contact.supportSuccessMsg")}
                      </p>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="contact-name"
                            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                          >
                            {channel === "business" ? t("contact.fullName") : t("contact.name")}
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={channel === "business" ? t("contact.businessPlaceholderName") : t("contact.supportPlaceholderName")}
                            className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-email"
                            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                          >
                            {channel === "business" ? t("contact.workEmail") : t("contact.email")}
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={channel === "business" ? t("contact.businessPlaceholderEmail") : t("contact.supportPlaceholderEmail")}
                            className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                        >
                          {channel === "business" ? t("contact.interestedIn") : t("contact.subject")}
                        </label>
                        <select
                          id="contact-subject"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                        >
                          <option value="">{t("contact.selectTopic")}</option>
                          {subjects.map((s, i) => (
                            <option key={i} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-message"
                          className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                        >
                          {t("contact.message")}
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={channel === "business" ? t("contact.businessPlaceholderMsg") : t("contact.supportPlaceholderMsg")}
                          className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {errorMsg}
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === "sending" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("contact.sending")}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {channel === "business" ? t("contact.talkToSales") : t("contact.sendMessage")}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
