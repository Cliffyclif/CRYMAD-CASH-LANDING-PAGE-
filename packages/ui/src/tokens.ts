/** Emerald Pulse design tokens — source of truth for web + mobile */
export const tokens = {
  color: {
    bg: "#040d0a",
    bgAlt: "#0b1512",
    surface: "rgba(44, 55, 51, 0.4)",
    surfaceSolid: "#0e1815",
    border: "rgba(16, 185, 129, 0.08)",
    borderStrong: "rgba(16, 185, 129, 0.24)",
    primary: "#10b981",
    primaryDim: "#059669",
    secondary: "#34d399",
    accent: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    text: "#d9e5df",
    textMuted: "#bbcabf",
    textDim: "rgba(217, 229, 223, 0.4)",
  },
  font: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  radius: {
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    full: "9999px",
  },
  shadow: {
    glow: "0 0 60px rgba(16, 185, 129, 0.15)",
    glowStrong: "0 0 80px rgba(16, 185, 129, 0.25)",
  },
  blur: {
    glass: "20px",
    bg: "80px",
  },
  motion: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "600ms cubic-bezier(0.4, 0, 0.2, 1)",
    drift: "60s ease-in-out infinite",
    pulse: "2s ease-in-out infinite",
  },
} as const;

export type Tokens = typeof tokens;
