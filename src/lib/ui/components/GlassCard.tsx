import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn.js";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function GlassCard({ children, className, padding = "md", glow, ...rest }: GlassCardProps) {
  const pad = padding === "sm" ? "p-5" : padding === "lg" ? "p-10" : "p-7";
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-xl",
        pad,
        glow && "shadow-glow",
        className,
      )}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-40 w-40"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
