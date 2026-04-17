import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard.js";

interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
}

export function StatTile({ label, value, sub, trend, trendValue }: StatTileProps) {
  const trendColor =
    trend === "up" ? "text-primary" : trend === "down" ? "text-danger" : "text-text-muted";
  const trendArrow = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";
  return (
    <GlassCard padding="md">
      <div className="label-mono mb-3">{label}</div>
      <div className="font-mono text-4xl font-bold tracking-tight text-text">{value}</div>
      {(sub || trendValue) && (
        <div className="mt-3 flex items-center gap-2 font-mono text-xs">
          {trendValue && (
            <span className={trendColor}>
              {trendArrow} {trendValue}
            </span>
          )}
          {sub && <span className="text-text-muted">{sub}</span>}
        </div>
      )}
    </GlassCard>
  );
}
