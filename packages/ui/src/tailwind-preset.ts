import type { Config } from "tailwindcss";
import { tokens } from "./tokens.js";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: tokens.color.bg,
        "bg-alt": tokens.color.bgAlt,
        surface: tokens.color.surface,
        "surface-solid": tokens.color.surfaceSolid,
        border: tokens.color.border,
        "border-strong": tokens.color.borderStrong,
        primary: tokens.color.primary,
        "primary-dim": tokens.color.primaryDim,
        secondary: tokens.color.secondary,
        accent: tokens.color.accent,
        success: tokens.color.success,
        danger: tokens.color.danger,
        warning: tokens.color.warning,
        text: tokens.color.text,
        "text-muted": tokens.color.textMuted,
        "text-dim": tokens.color.textDim,
      },
      fontFamily: {
        sans: [tokens.font.sans],
        mono: [tokens.font.mono],
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
      },
      boxShadow: {
        glow: tokens.shadow.glow,
        "glow-strong": tokens.shadow.glowStrong,
      },
      backdropBlur: {
        glass: tokens.blur.glass,
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(40px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-30px, 30px) scale(0.95)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        drift: "drift 60s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
};

export default preset;
