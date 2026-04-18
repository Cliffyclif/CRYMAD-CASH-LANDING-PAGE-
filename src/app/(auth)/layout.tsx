"use client";

import { useEffect, useRef } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("crymad-mode");
    const theme = saved === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);

    const canvas = bgRef.current;
    if (!canvas) return;
    for (let i = 0; i < 15; i++) {
      const p = document.createElement("div");
      p.classList.add("particle");
      const size = 2 + Math.random() * 3;
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = -(Math.random() * 20) + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = 12 + Math.random() * 20 + "s";
      p.style.animationDelay = Math.random() * 15 + "s";
      p.style.opacity = "0";
      canvas.appendChild(p);
    }
    return () => {
      canvas.querySelectorAll(".particle").forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      {/* Living Background */}
      <div className="bg-canvas" ref={bgRef}>
        <div className="energy-blob" />
        <div className="energy-blob" />
        <div className="energy-blob" />
        <div className="energy-blob" />
      </div>

      {/* Centered Auth Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 24,
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
            padding: "40px 32px",
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

          {/* Logo */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                color: "var(--primary)",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1,
                textShadow: "0 0 20px rgba(var(--primary-rgb), 0.4)",
              }}
            >
              CRYMAD CA$H
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>
    </>
  );
}
