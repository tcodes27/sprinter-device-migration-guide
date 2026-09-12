import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { ProgressDots } from "./ProgressDots";
import { cn } from "@/lib/utils";

type Props = {
  deviceName: string;
  /** e.g. "Update + Reset" */
  pathLabel: string;
  /** Ordered phases, e.g. ["Update","Verify","Reset","Setup","Configure","Verify"] */
  phases: string[];
  currentPhase: string;
  index: number;
  total: number;
  completed: number[];
  left: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
  children?: ReactNode;
};

/** Split layout: sticky "you are here" on top, practice device left / instructions right, sticky actions at the bottom. */
export function StepShell({ deviceName, pathLabel, phases, currentPhase, index, total, completed, left, right, bottom, children }: Props) {
  const [demoOpen, setDemoOpen] = useState(false);
  const phaseIdx = phases.findIndex((p, i) => p === currentPhase && (i === phases.length - 1 || p !== phases[i + 1] || true));
  // Highlight the *current* occurrence of a repeated phase (e.g. two "Verify") by walking with the step index.
  const current = currentPhaseIndex(phases, currentPhase, index, total, phaseIdx);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDemoOpen(desktop.matches);
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  return (
    <div className="min-h-screen pb-36 lg:pb-28">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-muted-foreground">
            <Link to="/" aria-label="Home" className="shrink-0">
              <Logo />
            </Link>
            <nav aria-label="You are here" className="flex min-w-0 items-center gap-1">
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate font-black text-primary">{deviceName}</span>
              <ChevronRight className="hidden h-4 w-4 shrink-0 sm:inline" aria-hidden />
              <span className="hidden truncate sm:inline">{pathLabel}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-sm font-extrabold text-primary">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Step {index + 1} of {total}
            </span>
            <Link to="/" className="hidden rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted sm:inline">
              Devices
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-2.5">
          <ol className="flex flex-wrap items-center gap-1" aria-label="Route overview">
            {phases.map((p, i) => (
              <li key={`${p}-${i}`} className="flex items-center gap-1">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide", i < current ? "bg-success-soft text-success" : i === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{p}</span>
                {i < phases.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="min-w-[8rem] flex-1">
            <ProgressDots total={total} current={index} completed={completed} compact />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-5 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-10">
        <section aria-label="Practice demo" className="lg:sticky lg:top-28 lg:self-start">
          <details
            className="group card-soft overflow-hidden lg:overflow-visible"
            open={demoOpen}
            onToggle={(event) => setDemoOpen(event.currentTarget.open)}
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-extrabold text-primary marker:content-none lg:hidden">
              <span>See a practice demo</span>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="border-t p-4 group-open:block lg:block lg:border-t-0 lg:p-5">{left}</div>
          </details>
        </section>
        <section aria-label="Instructions" className="min-w-0">
          {right}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-4 sm:py-3 lg:pr-44">{bottom}</div>
      </div>
      {children}
    </div>
  );
}

/**
 * Phases can repeat (Verify after update, Verify at the end). Pick the occurrence
 * that matches where the Sprinter is: before the halfway mark → first, else → last.
 */
function currentPhaseIndex(phases: string[], phase: string, index: number, total: number, first: number) {
  const occurrences = phases.map((p, i) => (p === phase ? i : -1)).filter((i) => i >= 0);
  if (occurrences.length <= 1) return first;
  return index >= total - 2 ? occurrences[occurrences.length - 1]! : occurrences[0]!;
}
