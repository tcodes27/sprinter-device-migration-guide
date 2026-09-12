import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { SimScreen } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

type Props = { sequence: SimScreen[]; index: number; done: boolean };

/** Sub-actions for the current step; they check themselves off as the practice device is tapped through. */
export function InstructionPanel({ sequence, index, done }: Props) {
  const steps = sequence.filter((s) => s.kind !== "final");
  return (
    <ol className="space-y-2" aria-label="What to do">
      {steps.map((s, i) => {
        const isDone = done || i < index;
        const isCurrent = !done && i === index;
        return (
          <motion.li
            key={`${i}-${s.hint}`}
            layout
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
              isCurrent && "border-primary bg-primary-soft shadow-soft",
              isDone && "border-success/30 bg-success-soft/60",
              !isCurrent && !isDone && "border-transparent bg-muted/60",
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black",
                isDone ? "bg-success text-success-foreground" : isCurrent ? "bg-primary text-primary-foreground pulse-current" : "bg-card text-muted-foreground",
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
