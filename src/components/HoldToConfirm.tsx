import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { label: string; holdMs?: number; onConfirm: () => void; className?: string };

/** Press-and-hold button so an important confirmation can't happen by accident. Keyboard: press and hold Space/Enter. */
export function HoldToConfirm({ label, holdMs = 1200, onConfirm, className }: Props) {
  const reduce = useReducedMotion();
  const duration = reduce ? 500 : holdMs;
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const start = useRef<number | null>(null);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    start.current = null;
    if (!done) setPct(0);
  };

  const begin = () => {
    if (done || start.current !== null) return;
    start.current = performance.now();
    const tick = (t: number) => {
      if (start.current === null) return;
      const p = Math.min(1, (t - start.current) / duration);
      setPct(p * 100);
      if (p >= 1) {
        setDone(true);
        start.current = null;
        onConfirm();
      } else {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) begin();
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") stop();
      }}
      aria-label={`${label} — press and hold`}
      className={cn(
        "relative min-h-16 w-full select-none overflow-hidden rounded-2xl bg-warning-soft text-lg font-extrabold text-warning-foreground shadow-soft ring-2 ring-warning/60 transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
        done && "bg-success text-success-foreground ring-success",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 bg-warning/70" style={{ width: `${pct}%` }} aria-hidden />
      <span className="relative flex items-center justify-center gap-2 px-4">
        {done ? <Check aria-hidden /> : null}
        {done ? "Confirmed" : label}
      </span>
      {!done && <span className="relative block pb-2 text-xs font-bold opacity-80">Press and hold to confirm</span>}
    </button>
  );
}
