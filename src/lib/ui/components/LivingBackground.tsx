import type { CSSProperties } from "react";

/** Full-viewport animated emerald pulse blob background. */
export function LivingBackground() {
  const blob: CSSProperties = {
    position: "absolute",
    filter: "blur(80px)",
    opacity: 0.3,
    borderRadius: "50%",
    animation: "drift 60s ease-in-out infinite",
    pointerEvents: "none",
  };
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -2,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{ ...blob, width: 600, height: 600, background: "#10b981", top: "-15%", left: "-15%" }} />
      <div style={{ ...blob, width: 500, height: 500, background: "#34d399", bottom: "-10%", right: "-10%", animationDelay: "-20s" }} />
      <div style={{ ...blob, width: 400, height: 400, background: "#10b981", top: "30%", right: "15%", animationDelay: "-40s" }} />
      <div style={{ ...blob, width: 700, height: 700, background: "#0b1512", bottom: "20%", left: "20%", animationDelay: "-10s" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(45deg, transparent 48%, rgba(16,185,129,0.05) 50%, transparent 52%)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
