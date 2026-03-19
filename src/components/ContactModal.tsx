"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle, AlertCircle, Loader2, Building2, Globe, Wallet, Shield, Zap } from "lucide-react";

type ContactChannel = "support" | "business" | "compliance";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: ContactChannel;
}

type FormStatus = "idle" | "sending" | "success" | "error";

const CHANNEL_CONFIG: Record<ContactChannel, {
  title: string;
  description: string;
  subjects: string[];
}> = {
  support: {
    title: "Get in Touch",
    description: "We'd love to hear from you",
    subjects: [
      "Personal Account Inquiry",
      "Card Services",
      "Technical Support",
      "General Question",
      "Other",
    ],
  },
  business: {
    title: "Business Inquiries",
    description: "Let's explore how Crymad Cash can power your business",
    subjects: [
      "Business Solutions",
      "Business Account Setup",
      "Global Payments",
      "Crypto Integration",
      "Partnership Opportunity",
      "API & Developer Access",
      "Other",
    ],
  },
  compliance: {
    title: "Compliance & Legal",
    description: "Questions about our policies and regulatory compliance",
    subjects: [
      "AML Policy",
      "Terms of Service",
      "Privacy Policy",
      "Risk Disclosure",
      "Partner Disclosures",
      "KYC / Identity Verification",
      "Regulatory Inquiry",
      "Other",
    ],
  },
};

export function ContactModal({ isOpen, onClose, channel = "support" }: ContactModalProps) {
  const config = CHANNEL_CONFIG[channel];
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
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
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
                      {config.title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {config.description}
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
                      Why Crymad Cash for Business
                    </p>
                    <div className="flex flex-col gap-4">
                      {[
                        { icon: Globe, title: "150+ Countries", desc: "Send and receive payments globally with competitive FX rates" },
                        { icon: Wallet, title: "Multi-Currency Accounts", desc: "Hold, convert, and manage 100+ fiat & crypto currencies" },
                        { icon: Shield, title: "Enterprise Security", desc: "AES-256 encryption, MFA, and real-time fraud monitoring" },
                        { icon: Zap, title: "Instant Settlement", desc: "Near-instant cross-border transfers with transparent fees" },
                      ].map((item) => (
                        <div key={item.title} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#36D399]/10">
                            <item.icon className="h-4 w-4 text-[#36D399]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-xl bg-[#36D399]/5 border border-[#36D399]/10 p-4">
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Trusted by businesses across <strong className="text-[var(--text-primary)]">150+ countries</strong>. Our dedicated sales team will help you find the right solution for your needs.
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
                        {channel === "business" ? "We'll Be in Touch!" : "Message Sent!"}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {channel === "business"
                          ? "A member of our sales team will reach out within 24 hours to discuss your business needs."
                          : "Thank you for reaching out. We\u2019ll get back to you within 24 hours."}
                      </p>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
                      >
                        Done
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
                            {channel === "business" ? "Full Name" : "Name"}
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={channel === "business" ? "John Doe" : "Your name"}
                            className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-email"
                            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                          >
                            {channel === "business" ? "Work Email" : "Email"}
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={channel === "business" ? "you@company.com" : "you@example.com"}
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
                          {channel === "business" ? "I'm interested in" : "Subject"}
                        </label>
                        <select
                          id="contact-subject"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                        >
                          <option value="">Select a topic</option>
                          {config.subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor="contact-message"
                          className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                        >
                          Message
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={channel === "business" ? "Tell us about your business and what you're looking for..." : "How can we help you?"}
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
                            Sending...
                          </>
                        ) : channel === "business" ? (
                          <>
                            <Send className="h-4 w-4" />
                            Talk to Sales
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
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
