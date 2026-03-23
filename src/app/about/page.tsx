"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Zap,
  Globe,
  Shield,
  Users,
  Landmark,
  BadgeCheck,
  ArrowRight,
  Wallet,
  Lock,
  HeadphonesIcon,
} from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "Simplify global finance by offering accessible and secure digital financial services through innovative technology.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Combining traditional financial systems with digital innovation to make finance faster, smarter, and more accessible.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Users can manage funds, perform international payments, and access digital financial tools designed for the global economy.",
  },
  {
    icon: Shield,
    title: "Compliance",
    description:
      "We work with licensed financial partners and technology providers to deliver secure and compliant financial services.",
  },
];

const milestones = [
  {
    year: "Platform Launch",
    title: "Foundation",
    description:
      "Crymad Cash was founded with a vision to bridge the gap between traditional finance and digital innovation, making global payments accessible to everyone.",
  },
  {
    year: "Multi-Currency",
    title: "10+ Currencies",
    description:
      "Expanded support to over 100 fiat and crypto currencies, enabling users to hold, convert, and transact across borders with competitive exchange rates.",
  },
  {
    year: "Global Expansion",
    title: "150+ Countries",
    description:
      "Extended our services to over 50 countries worldwide, partnering with licensed financial institutions to ensure local compliance and seamless operations.",
  },
  {
    year: "Enterprise",
    title: "Business Solutions",
    description:
      "Launched dedicated business accounts with API access, bulk payments, multi-user management, and tailored solutions for companies of all sizes.",
  },
];

const stats = [
  { value: "150+", label: "Countries Served", icon: Globe },
  { value: "100+", label: "Currencies Supported", icon: Wallet },
  { value: "24/7", label: "Customer Support", icon: HeadphonesIcon },
  { value: "100%", label: "Digital-First", icon: Zap },
];

const teamValues = [
  {
    icon: Users,
    title: "People First",
    description:
      "Every decision we make is guided by how it impacts our users. We build financial tools that put people in control of their money.",
  },
  {
    icon: Landmark,
    title: "Regulatory Excellence",
    description:
      "We partner with licensed financial institutions and comply with international regulations including AML, KYC, and data protection standards.",
  },
  {
    icon: BadgeCheck,
    title: "Transparency",
    description:
      "No hidden fees, no fine print. We believe in clear pricing, honest communication, and building trust through every interaction.",
  },
  {
    icon: Lock,
    title: "Security by Design",
    description:
      "AES-256 encryption, multi-factor authentication, and real-time fraud monitoring are built into every layer of our platform.",
  },
];

export default function AboutPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--section-alt)] to-[var(--background)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div {...fadeUp}>
                <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
                  About Us
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]">
                  Redefining{" "}
                  <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                    Digital Finance
                  </span>
                </h1>
                <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
                  Crymad Cash is a financial technology platform that provides modern banking
                  solutions for individuals and businesses worldwide. By combining traditional
                  financial systems with digital innovation, we make global finance faster,
                  smarter, and more accessible.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="https://production-crmdx.web.app/sign-up"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white hover:brightness-110 transition-all"
                  >
                    Open an Account
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 transition-all"
                  >
                    Contact Us
                  </button>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#36D399]/10 to-[#4AE8AC]/10 rounded-3xl blur-2xl" />
                  <div className="relative bg-[var(--surface-elevated)] border border-[var(--glass-border)] rounded-3xl p-8 md:p-12">
                    <div className="flex justify-center mb-8">
                      <Image
                        src="https://res.cloudinary.com/dxvi5d6dr/image/upload/v1766762874/photo_2025-12-24_18.04.43-removebg-preview_ck9wyx.png"
                        alt="Crymad Cash"
                        width={120}
                        height={120}
                        className="h-24 w-24 md:h-28 md:w-28 object-contain"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { value: "150+", label: "Countries" },
                        { value: "24/7", label: "Support" },
                        { value: "100%", label: "Digital" },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.15 }}
                          className="p-4"
                        >
                          <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                          <p className="text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-8 h-1 w-full rounded-full bg-gradient-to-r from-[#36D399] via-[#4AE8AC] to-[#36D399] opacity-40" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 border-y border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#36D399]/10">
                    <stat.icon className="h-6 w-6 text-[#36D399]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
                What Drives Us
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Our Core{" "}
                <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                  Values
                </span>
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Built on a foundation of trust, innovation, and a commitment to making global finance work for everyone.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] p-6 hover:border-[#36D399]/30 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#36D399]/10 mb-4">
                    <item.icon className="h-6 w-6 text-[#36D399]" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey / Milestones */}
        <section className="py-20 md:py-28 bg-[var(--section-alt)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
                Our Journey
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Building the Future of{" "}
                <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                  Finance
                </span>
              </h2>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#36D399]/40 via-[#36D399]/20 to-transparent hidden sm:block" />

              <div className="flex flex-col gap-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className={`relative flex flex-col sm:flex-row gap-6 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 top-2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#36D399] border-2 border-[var(--background)] shadow-lg shadow-[#36D399]/30 hidden sm:block" />

                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                      <span className="inline-block text-xs font-bold text-[#36D399] uppercase tracking-widest mb-2">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{milestone.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{milestone.description}</p>
                    </div>
                    <div className="hidden md:block flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What We Stand For */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[#36D399] uppercase tracking-widest mb-4">
                Our Principles
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                What We{" "}
                <span className="bg-gradient-to-r from-[#36D399] to-[#4AE8AC] bg-clip-text text-transparent">
                  Stand For
                </span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {teamValues.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-elevated)] p-6 hover:border-[#36D399]/30 transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#36D399]/10">
                    <item.icon className="h-6 w-6 text-[#36D399]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 bg-[var(--section-alt)]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Ready to experience the future of finance?
              </h2>
              <p className="mt-4 text-lg text-[var(--text-secondary)]">
                Join thousands of individuals and businesses across 50+ countries.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://production-crmdx.web.app/sign-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/25"
                >
                  Open an Account
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-8 py-3.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 transition-all"
                >
                  Contact Us
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} channel="support" />
    </>
  );
}
