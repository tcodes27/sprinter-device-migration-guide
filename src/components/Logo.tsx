import { cn } from "@/lib/utils";

/** Sprinter Health wordmark. Swap the mark for the official logo asset when available. */
export function Logo({ className, subtitle = "Device Migration" }: { className?: string; subtitle?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Sprinter Health</div>
        <div className="text-base font-extrabold text-heading">{subtitle}</div>
      </div>
    </div>
  );
}
