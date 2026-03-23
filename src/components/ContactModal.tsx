"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle, AlertCircle, Loader2, Building2, Globe, Wallet, Shield, Zap } from "lucide-react";
import { useLanguage, useTranslatedArray } from "@/i18n/LanguageContext";

type ContactChannel = "support" | "business" | "compliance";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: ContactChannel;
}

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactModal({ isOpen, onClose, channel = "support" }: ContactModalProps) {
  const { t } = useLanguage();
  const subjects = useTranslatedArray(`contact.${channel}.subjects`);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset subject when channel changes
  useEffect(() => {
    setSubject("");
  }, [channel]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    if (status === "success") resetForm();
    onClose();
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className={`relative w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] shadow-2xl overflow-hidden ${
                channel === "business" ? "max-w-3xl" : "max-w-lg"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  {channel === "business" && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#36D399]/10">
                      <Building2 className="h-5 w-5 text-[#36D399]" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {t(`contact.${channel}.title`)}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {t(`contact.${channel}.description`)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--glass-bg)] transition-colors text-[var(--text-secondary)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className={`${channel === "business" ? "flex flex-col md:flex-row" : ""}`}>
                {/* Business sidebar — value props */}
                {channel === "business" && status !== "success" && (
                  <div className="md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-6">
                    <p className="text-xs font-semibold text-[#36D399] uppercase tracking-widest mb-5">
                      {t("contact.whyBusiness")}
                    </p>
                    <div className="flex flex-col gap-4">
                      {[
                        { icon: Globe, titleKey: "contact.countriesLabel", descKey: "contact.countriesDesc" },
                        { icon: Wallet, titleKey: "contact.multiCurrencyTitle", descKey: "contact.multiCurrencyDesc" },
                        { icon: Shield, titleKey: "contact.enterpriseSecurity", descKey: "contact.enterpriseSecurityDesc" },
                        { icon: Zap, titleKey: "contact.instantSettlement", descKey: "contact.instantSettlementDesc" },
                      ].map((item) => (
                        <div key={item.titleKey} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#36D399]/10">
                            <item.icon className="h-4 w-4 text-[#36D399]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{t(item.titleKey)}</p>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{t(item.descKey)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-xl bg-[#36D399]/5 border border-[#36D399]/10 p-4">
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {t("contact.trustedBy")} <strong className="text-[var(--text-primary)]">{t("contact.fiftyPlusCountries")}</strong>{t("contact.salesTeamHelp")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex-1 px-6 py-6">
                  {status === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
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
                        onClick={handleClose}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
                      >
                        {t("contact.done")}
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      {/* Name & Email row */}
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

                      {/* Subject */}
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

                      {/* Message */}
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
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={channel === "business" ? t("contact.businessPlaceholderMsg") : t("contact.supportPlaceholderMsg")}
                          className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      {/* Error message */}
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

                      {/* Submit button */}
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
                        ) : channel === "business" ? (
                          <>
                            <Send className="h-4 w-4" />
                            {t("contact.talkToSales")}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {t("contact.sendMessage")}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
