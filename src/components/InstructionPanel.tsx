import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Checkpoint } from "@/lib/checkpoints";
import { countDone } from "@/lib/checkpoints";
import { cn } from "@/lib/utils";

type Props = {
  checkpoints: Checkpoint[];
  /** Ids of tasks that are done (detected on the practice device, ticked by hand, or confirmed). */
  done: number[];
  /** Index of the current task = the first one not done. */
  current: number;
  onToggle?: (i: number) => void;
  /** Hide the "x of y" line (e.g. when the parent shows its own). */
  hideCount?: boolean;
};

/**
 * The "What to do" checklist. Every task is a saved checkpoint: done tasks stay
 * visible with a check mark, exactly one task is current, the rest wait their turn.
 */
export function InstructionPanel({ checkpoints, done, current, onToggle, hideCount }: Props) {
  const total = checkpoints.length;
  const doneCount = countDone(checkpoints, done);
  const allDone = total > 0 && doneCount === total;
  return (
    <div>
      {!hideCount && (
        <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-muted-foreground" aria-live="polite">
          <span className={cn("rounded-full px-2.5 py-0.5", allDone ? "bg-success-soft text-success" : "bg-muted text-foreground")}>
            {doneCount} of {total} {total === 1 ? "task" : "tasks"} complete
          </span>
          {allDone && (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-4 w-4" aria-hidden /> Step complete
            </span>
          )}
        </p>
      )}
      <ol className="space-y-2" aria-label="What to do">
        {checkpoints.map((c, i) => {
          const isDone = done.includes(c.id);
          const isCurrent = !isDone && i === current;
          return (
            <motion.li
              key={`${c.id}-${c.label}`}
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
                aria-label={`${c.label}${isDone ? ", done" : isCurrent ? ", do this now" : ""}`}
                onClick={() => onToggle?.(c.id)}
                className="flex min-h-11 w-full items-start gap-3 rounded-2xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  {c.label}
                  {isCurrent && <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 align-middle text-[10px] font-black uppercase tracking-wider text-primary-foreground">Do this now</span>}
                </span>
              </button>
            </motion.li>
          );
        })}
        {allDone && (
          <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 pt-1 text-base font-extrabold text-success">
            <Check aria-hidden /> All done. Use the button below to continue.
          </motion.li>
        )}
      </ol>
    </div>
  );
}
