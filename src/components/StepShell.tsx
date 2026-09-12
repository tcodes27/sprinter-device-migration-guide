import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ProgressDots } from "./StepView";

type Props = {
  deviceName: string;
  index: number;
  total: number;
  completed: number[];
  left: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
  children?: ReactNode;
};

/** Split layout: sticky progress on top, practice device left / instructions right, sticky actions at the bottom. */
export function StepShell({ deviceName, index, total, completed, left, right, bottom, children }: Props) {
  return (
    <div className="min-h-screen pb-36 lg:pb-28">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" aria-label="Home" className="shrink-0">
              <Logo />
            </Link>
            <span className="hidden text-muted-foreground sm:inline">→</span>
            <span className="hidden truncate text-base font-black text-primary sm:inline">{deviceName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-extrabold text-primary">
              Step {index + 1} of {total}
            </span>
            <Link to="/" className="hidden rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted sm:inline">
              My devices
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-2.5">
          <ProgressDots total={total} current={index} completed={completed} compact />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-5 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-10">
        <section aria-label="Practice device" className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-soft p-5">{left}</div>
        </section>
        <section aria-label="Instructions" className="min-w-0">
          {right}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">{bottom}</div>
      </div>
      {children}
    </div>
  );
}
