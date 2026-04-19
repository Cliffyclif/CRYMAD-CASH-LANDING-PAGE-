"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("crymad-mode");
    const theme = saved === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <>
      {/* Living Background */}
      <div className="bg-canvas">
        <div className="energy-blob" />
        <div className="energy-blob" />
        <div className="energy-blob" />
        <div className="energy-blob" />
      </div>

      {/* Top-left brand mark */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: 24,
          left: 32,
          zIndex: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
        }}
      >
        <Image src="/icon-192.png" alt="Crymad Cash" width={28} height={28} style={{ borderRadius: 6 }} />
        <span
          style={{
            color: "var(--primary)",
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 2,
            textShadow: "0 0 18px rgba(var(--primary-rgb), 0.4)",
          }}
        >
          CRYMAD CA$H
        </span>
      </Link>

      {/* Top-right help */}
      <Link
        href="/help"
        aria-label="Help"
        style={{
          position: "fixed",
          top: 24,
          right: 32,
          zIndex: 10,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          textDecoration: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </Link>

      {/* Centered Auth Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "80px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            borderRadius: 24,
            maxWidth: 480,
            width: "100%",
            padding: "36px 32px 32px",
            position: "relative",
            overflow: "hidden",
            animation: "fadeIn 0.5s ease",
          }}
        >
          {/* Corner Glow Dots */}
          {[
            { top: 12, left: 12 },
            { top: 12, right: 12 },
            { bottom: 12, left: 12 },
            { bottom: 12, right: 12 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--primary)",
                boxShadow: "0 0 12px rgba(var(--primary-rgb), 0.6)",
                animation: "cornerGlow 3s ease-in-out infinite",
                animationDelay: `${i * 0.4}s`,
                ...pos,
              } as React.CSSProperties}
            />
          ))}

          {/* In-card brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 22 }}>
            <Image
              src="/icon-192.png"
              alt="Crymad Cash"
              width={48}
              height={48}
              style={{
                borderRadius: 12,
                boxShadow: "0 0 24px rgba(var(--primary-rgb), 0.35)",
              }}
            />
            <div
              style={{
                color: "var(--primary)",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 3,
                textShadow: "0 0 18px rgba(var(--primary-rgb), 0.4)",
              }}
            >
              CRYMAD CA$H
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: "fixed",
          bottom: 20,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>
          © 2026 CRYMAD CA$H &nbsp;·&nbsp; ALL RIGHTS RESERVED
        </span>
        <span style={{ display: "inline-flex", gap: 24, pointerEvents: "auto" }}>
          {["Terms", "Privacy", "Security"].map((l) => (
            <Link
              key={l}
              href="#"
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              {l}
            </Link>
          ))}
        </span>
      </footer>
    </>
  );
}
