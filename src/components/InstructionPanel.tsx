import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { SimScreen } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

type Props = {
  sequence: SimScreen[];
  index: number;
  done: boolean;
  /** Sub-steps the Sprinter ticked off by hand. */
  checked?: number[];
  onToggle?: (i: number) => void;
};

/** Sub-actions for the current step. They check themselves off as the practice device is tapped through, and the Sprinter can also tick them by hand. */
export function InstructionPanel({ sequence, index, done, checked = [], onToggle }: Props) {
  const steps = sequence.filter((s) => s.kind !== "final");
  return (
    <ol className="space-y-2" aria-label="What to do">
      {steps.map((s, i) => {
        const auto = done || i < index;
        const isDone = auto || checked.includes(i);
        const isCurrent = !done && i === index && !isDone;
        return (
          <motion.li
            key={`${i}-${s.hint}`}
            layout
            className={cn(
              "rounded-2xl border transition-colors",
              isCurrent && "border-primary bg-primary-soft shadow-soft",
              isDone && "border-success/30 bg-success-soft/60",
              !isCurrent && !isDone && "border-transparent bg-muted/60",
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={isDone}
              aria-label={`${s.hint}${isDone ? ", done" : ""}`}
              onClick={() => onToggle?.(i)}
              className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-black transition-colors",
                  isDone
                    ? "border-success bg-success text-success-foreground"
                    : isCurrent
                      ? "border-primary bg-primary text-primary-foreground pulse-current"
                      : "border-primary/25 bg-card text-muted-foreground",
                )}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7" className="draw-check" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn("pt-1 text-base font-bold", isDone && "text-muted-foreground line-through decoration-success/60", isCurrent && "text-lg font-extrabold text-foreground")}>
                {s.hint}
                {isCurrent && <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 align-middle text-[10px] font-black uppercase tracking-wider text-primary-foreground">Do this now</span>}
              </span>
            </button>
          </motion.li>
        );
      })}
      {done && (
        <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 pt-1 text-base font-extrabold text-success">
          <Check aria-hidden /> All done on the practice device.
        </motion.li>
      )}
    </ol>
  );
}
