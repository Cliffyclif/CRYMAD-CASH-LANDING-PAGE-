"use client";

import { useState, useEffect, useRef } from "react";

/* ── Constants ────────────────────────────────────────────── */
const ROTATION_SPEED = 12; // degrees per second
const MAP_WIDTH = 2048;

/* ── Main Globe — clean, no overlays ──────────────────────── */
export function Globe3D() {
  const [globeSize, setGlobeSize] = useState(300);
  const [bgPos, setBgPos] = useState(0);
  const rafRef = useRef(0);
  const prevTimeRef = useRef(0);

  // Single JS loop drives the texture rotation
  useEffect(() => {
    let currentLng = 0;

    const tick = (time: number) => {
      if (prevTimeRef.current === 0) prevTimeRef.current = time;
      const dt = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;

      currentLng = (currentLng + ROTATION_SPEED * dt) % 360;
      setBgPos((currentLng / 360) * MAP_WIDTH);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Responsive size
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setGlobeSize(w >= 1280 ? 500 : w >= 1024 ? 450 : w >= 640 ? 400 : 320);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
      <div className="relative">
        {/* Atmospheric glow */}
        <div
          className="absolute -inset-8 rounded-full opacity-25 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(195,244,255,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Globe */}
        <div
          style={{
            width: globeSize,
            height: globeSize,
            borderRadius: "50%",
            background: 'url("/earth-map.jpg") repeat-x',
            backgroundSize: "auto 100%",
            backgroundPosition: `${bgPos}px 0`,
            boxShadow:
              "0px 0 30px rgba(195,244,255,0.15), " +
              "-5px 0px 10px rgba(195,244,255,0.2) inset, " +
              "15px 2px 20px rgba(0,0,0,0.5) inset, " +
              "-20px -2px 30px rgba(195,244,255,0.3) inset, " +
              "180px 0px 50px rgba(0,0,0,0.3) inset, " +
              "100px 0px 30px rgba(0,0,0,0.4) inset",
          }}
        />
      </div>
    </div>
  );
}
