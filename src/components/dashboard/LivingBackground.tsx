"use client";

import { useEffect, useRef } from "react";

/** The animated blob + particle background. Shared by every dashboard page. */
export function LivingBackground() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    for (let i = 0; i < 20; i++) {
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
    <div className="bg-canvas" ref={bgRef}>
      <div className="energy-blob" />
      <div className="energy-blob" />
      <div className="energy-blob" />
      <div className="energy-blob" />
    </div>
  );
}
