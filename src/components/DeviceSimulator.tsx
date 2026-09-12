import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Play, RotateCcw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimScreenRenderer } from "./SimScreenRenderer";
import type { SimItem, SimScreen } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

export type SimPhase = "ready" | "waiting" | "done";

type Props = {
  sequence: SimScreen[];
  frame: "phone" | "tablet" | "tablet-wide";
  /** Change this to reset the simulator (e.g. step id) */
  resetKey: string;
  /**
   * Screen the device should show, derived from saved checkpoints
   * (the first task not yet done). Restored on load; when it changes from the
   * outside (a box ticked by hand) the device jumps to that screen.
   */
  syncIndex?: number;
  /** Fired when the Sprinter completes screen `i` (tap on the target, or a wait finished). */
  onScreenPassed?: (i: number) => void;
  onComplete?: () => void;
  onProgress?: (index: number, phase: SimPhase) => void;
  large?: boolean;
  hideControls?: boolean;
};

/**
 * Tap-along practice device. The Sprinter taps the glowing element to move
 * through the same screens they will see on their real device.
 */
export function DeviceSimulator({ sequence, frame, resetKey, syncIndex = 0, onScreenPassed, onComplete, onProgress, large, hideControls }: Props) {
  const reduce = useReducedMotion() ?? false;
  const last = sequence.length - 1;
  const start = Math.min(Math.max(0, syncIndex), last);
  const [idx, setIdx] = useState(start);
  const [phase, setPhase] = useState<SimPhase>(phaseFor(sequence[start]));
  const [dir, setDir] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [coach, setCoach] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [pressing, setPressing] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedRef = useRef(start >= last);
  const idxRef = useRef(start);
  const syncRef = useRef(start);
  idxRef.current = idx;
  syncRef.current = start;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    onProgress?.(idx, phase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  const goTo = useCallback(
    (next: number, isAuto: boolean, direction = 1) => {
      const screen = sequence[next];
      if (!screen) return;
      setDir(direction);
      setIdx(next);
      setCoach(false);
      const p = phaseFor(screen);
      setPhase(p);
      if (p === "waiting" && screen.kind === "progress") {
        later(() => {
          if (!isAuto) onScreenPassed?.(next);
          goTo(next + 1, isAuto);
        }, reduce ? 700 : screen.durationMs);
      }
      if (p === "done") {
        if (isAuto) {
          // Hand control back so the Sprinter can carry on where they were
          later(() => {
            setAutoplay(false);
            goTo(syncRef.current, false, -1);
          }, 1600);
        } else if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sequence, reduce, onComplete, onScreenPassed],
  );

  // Reset when the step changes: open on the saved position
  useEffect(() => {
    clearTimers();
    completedRef.current = start >= last;
    setAutoplay(false);
    setPressing(false);
    setWrong(0);
    goTo(start, false, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Keep the device in step with the checklist (e.g. a box ticked or unticked by hand)
  useEffect(() => {
    if (autoplay) return;
    if (start === idxRef.current) return;
    clearTimers();
    setPressing(false);
    goTo(start, false, start > idxRef.current ? 1 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  // Autoplay: press the target, then advance
  useEffect(() => {
    if (!autoplay || phase !== "ready") return;
    later(() => setPressing(true), reduce ? 400 : 1000);
    later(() => {
      setPressing(false);
      goTo(idx + 1, true);
    }, reduce ? 650 : 1300);
    return clearTimers;
  }, [autoplay, phase, idx, goTo, reduce]);

  const handleTap = (item: SimItem | null) => {
    if (autoplay || phase !== "ready") return;
    if (item?.target) {
      onScreenPassed?.(idx);
      goTo(idx + 1, false);
    } else {
      setWrong((w) => w + 1);
      setCoach(true);
    }
  };

  const restart = () => {
    clearTimers();
    setAutoplay(false);
    setPressing(false);
    goTo(0, false, -1);
  };

  const watch = () => {
    clearTimers();
    goTo(0, false, -1);
    setAutoplay(true);
  };

  const screen = sequence[idx] ?? sequence[0]!;
  const aspect = frame === "phone" ? "aspect-[9/18]" : frame === "tablet" ? "aspect-[3/4]" : "aspect-[4/3]";
  const width = large ? "max-w-md" : frame === "phone" ? "max-w-[250px]" : frame === "tablet" ? "max-w-[300px]" : "max-w-[380px]";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground" aria-live="polite">
        {phase === "done" ? (
          <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-success normal-case tracking-normal">
            <Check className="h-4 w-4" aria-hidden /> Nice, you did it
          </span>
        ) : autoplay ? (
          <span className="rounded-full bg-primary-soft px-3 py-1 text-primary normal-case tracking-normal">Watch the glowing spot…</span>
        ) : phase === "waiting" ? (
          <span className="rounded-full bg-primary-soft px-3 py-1 text-primary normal-case tracking-normal">Waiting, this is normal</span>
        ) : (
          <span>Practice device · tap the glowing spot</span>
        )}
      </div>

      <div key={wrong} className={cn("w-full", width, wrong > 0 && !reduce && "wiggle")}>
        <div className={cn("relative overflow-hidden rounded-[2rem] border-[7px] border-deep bg-screen shadow-float", aspect)}>
          <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-muted-foreground">
            <span>9:41</span>
            <Wifi className="h-3 w-3" aria-hidden />
          </div>
          <div className="absolute inset-x-0 bottom-0 top-6 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={`${resetKey}-${idx}`}
                custom={dir}
                initial={reduce ? false : { x: dir > 0 ? "60%" : "-60%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { x: dir > 0 ? "-40%" : "40%", opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <SimScreenRenderer screen={screen} onTap={handleTap} pressing={pressing} showCoach={coach && !autoplay} reducedMotion={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Home indicator */}
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center">
            <span className="h-1 w-16 rounded-full bg-foreground/25" />
          </div>
        </div>
      </div>

      <p className="min-h-6 text-center text-base font-extrabold text-primary" aria-live="polite">
        {phase === "done" ? "Now do the same on your real device." : screen.hint}
      </p>

      {!hideControls && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="soft" size="sm" onClick={watch} disabled={autoplay}>
            <Play aria-hidden /> Watch me do it
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={restart} disabled={idx === 0 && phase === "ready"}>
            <RotateCcw aria-hidden /> Start over
          </Button>
        </div>
      )}
    </div>
  );
}

function phaseFor(screen: SimScreen | undefined): SimPhase {
  if (!screen) return "done";
  if (screen.kind === "progress") return "waiting";
  if (screen.kind === "final") return "done";
  return "ready";
}
