import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ProgressDots({ total, current, completed, compact }: { total: number; current: number; completed: number[]; compact?: boolean }) {
  return (
    <ol className={cn("flex items-center", compact ? "gap-1" : "mt-3 gap-1.5")} aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const done = completed.includes(i) && i !== current;
        const isCurrent = i === current;
        return (
          <li key={i} className="flex flex-1 items-center">
            <motion.span
              layout
              initial={false}
              animate={isCurrent ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-colors",
                compact ? "h-3.5 w-3.5" : "h-6 w-6",
                done && "bg-success text-success-foreground",
                isCurrent && "bg-primary text-primary-foreground pulse-current",
                !done && !isCurrent && "border-2 border-border bg-card",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {!compact && (done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1)}
              <span className="sr-only">{done ? "complete" : isCurrent ? "current" : "not started"}</span>
            </motion.span>
            {i < total - 1 && (
              <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
                <motion.span className="absolute inset-y-0 left-0 bg-success" initial={false} animate={{ width: done ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
