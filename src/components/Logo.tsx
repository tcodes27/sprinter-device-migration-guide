import { cn } from "@/lib/utils";

/** Sprinter Health wordmark. Swap the mark for the official logo asset when available. */
export function Logo({
  className,
  subtitle = "Device Migration",
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2 sm:gap-3", className)}>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft sm:h-11 sm:w-11"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </svg>
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-muted-foreground sm:text-[0.7rem] sm:tracking-[0.18em]">
          Sprinter Health
        </div>
        <div className="truncate text-sm font-extrabold text-heading sm:text-base">{subtitle}</div>
      </div>
    </div>
  );
}
