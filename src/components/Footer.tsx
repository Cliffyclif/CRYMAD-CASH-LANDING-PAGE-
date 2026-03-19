"use client";

import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  Products: [
    { label: "Personal Accounts", href: "https://production-crmdx.web.app/login" },
    { label: "Business Accounts", href: "https://production-crmdx.web.app/login" },
    { label: "Global Payments", href: "#contact-business" },
    { label: "Crypto Integration", href: "#contact-business" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Security", href: "/security" },
    { label: "FAQ", href: "/faq" },
    { label: "Support", href: "#contact" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/legal/terms-of-service" },
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
    { label: "AML Policy", href: "/legal/aml-policy" },
    { label: "Risk Disclosure", href: "/legal/risk-disclosure" },
    { label: "Partner Disclosures", href: "/legal/partner-disclosures" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#home" className="inline-flex items-center gap-2" aria-label="Crymad Cash home">
              <Image
                src="https://res.cloudinary.com/dxvi5d6dr/image/upload/v1766762874/photo_2025-12-24_18.04.43-removebg-preview_ck9wyx.png"
                alt="Crymad Cash logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-foreground">CRYMAD</span>{" "}
                <span className="text-primary">CA$H</span>
              </span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Modern financial technology platform providing banking solutions for individuals and
              businesses worldwide.
            </p>

            {/* Social Icons - Isometric Style */}
            <div className="mt-6 flex gap-3">
              {[
                { name: "Twitter", env: "NEXT_PUBLIC_SOCIAL_TWITTER", color: "#1DA1F2", icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                )},
                { name: "YouTube", env: "NEXT_PUBLIC_SOCIAL_YOUTUBE", color: "#FF0000", icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                )},
                { name: "Instagram", env: "NEXT_PUBLIC_SOCIAL_INSTAGRAM", color: "#E4405F", icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>
                )},
                { name: "Telegram", env: "NEXT_PUBLIC_SOCIAL_TELEGRAM", color: "#26A5E4", icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                )},
                { name: "TikTok", env: "NEXT_PUBLIC_SOCIAL_TIKTOK", color: "#EE1D52", icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                )},
              ].map((social) => {
                const href = process.env[social.env] || "/";
                const isExternal = href.startsWith("http");
                return (
                <a
                  key={social.name}
                  href={href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={social.name}
                  className="group relative"
                >
                  {/* Isometric shadow layers */}
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-300 border" style={{ borderColor: social.color, boxShadow: `inset 0 0 20px rgba(255,255,255,0.3), 0 5px 5px rgba(0,0,0,0.16)` }} />
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] transition-all duration-300 border" style={{ borderColor: social.color }} />
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 group-hover:translate-x-[6px] group-hover:-translate-y-[6px] transition-all duration-300 border" style={{ borderColor: social.color }} />

                  {/* Main icon */}
                  <div
                    className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-[9px] group-hover:-translate-y-[9px]"
                    style={{
                      color: social.color,
                      boxShadow: "inset 0 0 20px rgba(255,255,255,0.15), inset 0 0 5px rgba(255,255,255,0.25), 0 5px 5px rgba(0,0,0,0.16)",
                    }}
                  >
                    {social.icon}
                  </div>
                </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => {
                  const cls = "text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:underline";
                  const isExternal = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{link.label}</a>
                      ) : link.href.startsWith("/") ? (
                        <Link href={link.href} className={cls}>{link.label}</Link>
                      ) : (
                        <a href={link.href} className={cls}>{link.label}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Crymad Cash. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md">
            Crymad Cash is a financial technology platform. Banking and payment services are
            provided by licensed financial institutions and regulated partners. Crymad Cash does
            not directly hold customer deposits.
          </p>
        </div>
      </div>
    </footer>
  );
}
