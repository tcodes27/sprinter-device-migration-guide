import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; stroke?: number; className?: string; label?: string; tone?: "primary" | "success" };

/** Animated circular progress (0–100). */
export function ProgressRing({ value, size = 72, stroke = 7, className, label, tone = "primary" }: Props) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
          className={tone === "success" ? "text-success" : "text-primary"}
        />
      </svg>
      <span className={cn("absolute text-sm font-black", tone === "success" ? "text-success" : "text-primary")}>{pct}%</span>
    </div>
  );
}
