import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ChevronUp, Lock, Sparkles, Wifi } from "lucide-react";
import type { SimItem, SimScreen } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

export type TapHandler = (item: SimItem | null) => void;

type Props = {
  screen: SimScreen;
  onTap: TapHandler;
  /** Highlight targets with a glow (off during autoplay "pressing" state uses pressing) */
  pressing?: boolean;
  /** Show the "Tap here" bubble on the target (after a wrong tap) */
  showCoach?: boolean;
  reducedMotion?: boolean;
};

/** Renders one simulated iOS-style screen. All tappable elements report back via onTap. */
export function SimScreenRenderer({ screen, onTap, pressing, showCoach, reducedMotion }: Props) {
  const targetCls = (item?: SimItem) => cn(item?.target && "tap-glow", item?.target && pressing && "scale-95 bg-warning-soft");

  const Coach = () =>
    showCoach ? (
      <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-warning px-3 py-1 text-[11px] font-black text-warning-foreground shadow-soft">
        Tap here ↓
      </span>
    ) : null;

  if (screen.kind === "home") {
    return (
      <div className="grid h-full grid-cols-3 content-start gap-x-2 gap-y-4 px-4 pt-6">
        {screen.apps.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onTap(a)}
            aria-label={a.target ? `${a.label} — tap this` : a.label}
            className="relative flex flex-col items-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
          >
            {a.target && <Coach />}
            <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground transition-transform", a.label === "Settings" ? "bg-muted-foreground" : a.target ? "bg-primary" : "bg-primary/40", targetCls(a))}>
              {a.label === "Settings" ? <SettingsGlyph /> : <span className="text-base font-black">{a.label.slice(0, 1)}</span>}
            </span>
            <span className="text-[10px] font-bold text-foreground">{a.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (screen.kind === "list") {
    return (
      <div className="flex h-full flex-col px-3 pt-2">
        <div className="mb-2 flex items-center gap-1 px-1">
          {screen.back ? (
            <button type="button" onClick={() => onTap(null)} className="flex items-center text-[11px] font-bold text-primary">
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {screen.back}
            </button>
          ) : (
            <span className="text-sm font-extrabold text-foreground">{screen.title}</span>
          )}
        </div>
        {screen.back && <div className="mb-2 px-1 text-sm font-extrabold text-foreground">{screen.title}</div>}
        <div className="space-y-1.5 overflow-y-auto no-scrollbar">
          {screen.items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onTap(item)}
              aria-label={item.target ? `${item.label} — tap this` : item.label}
              className={cn(
                "relative flex w-full items-center justify-between rounded-xl bg-screen-row px-3 py-2.5 text-left text-xs font-semibold text-foreground transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
                item.destructive && "text-danger",
                targetCls(item),
              )}
            >
              {item.target && <Coach />}
              <span>
                {item.label}
                {item.sub && <span className="block text-[10px] font-medium text-muted-foreground">{item.sub}</span>}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                {item.value}
                {item.checked ? <Check className="h-3.5 w-3.5 text-primary" aria-label="connected" /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
              </span>
            </button>
          ))}
        </div>
        {screen.footer && (
          <div className="mt-auto pb-3 pt-3">
            <button type="button" onClick={() => onTap(screen.footer ?? null)} className={cn("relative w-full rounded-xl bg-primary py-2.5 text-xs font-extrabold text-primary-foreground transition-transform", targetCls(screen.footer))}>
              {screen.footer.target && <Coach />}
              {screen.footer.label}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (screen.kind === "prompt") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5 pb-6 text-center" onClick={(e) => e.target === e.currentTarget && onTap(null)}>
        <div className="text-base font-black leading-tight text-foreground">{screen.title}</div>
        {screen.body && <p className="text-[11px] font-semibold text-muted-foreground">{screen.body}</p>}
        {screen.field && (
          <div className="flex w-full items-center gap-2 rounded-xl border bg-screen-row px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground">
            <Lock className="h-3 w-3 shrink-0" aria-hidden /> <span className="truncate">{screen.field}</span>
          </div>
        )}
        <div className="mt-1 flex w-full flex-col gap-2">
          {screen.buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => onTap(b)}
              aria-label={b.target ? `${b.label} — tap this` : b.label}
              className={cn(
                "relative w-full rounded-xl py-2.5 text-xs font-extrabold transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
                b.destructive ? "bg-danger text-danger-foreground" : b.target ? "bg-primary text-primary-foreground" : "bg-screen-row text-primary",
                targetCls(b),
              )}
            >
              {b.target && <Coach />}
              {b.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen.kind === "hello") {
    return (
      <div className="flex h-full flex-col items-center justify-between px-4 pb-4 pt-10" onClick={(e) => e.target === e.currentTarget && onTap(null)}>
        <HelloWord reducedMotion={reducedMotion} />
        <button
          type="button"
          onClick={() => onTap({ label: screen.label ?? "Open", target: true })}
          aria-label={`${screen.label ?? "Open"} — tap this`}
          className={cn("relative flex w-full flex-col items-center gap-1 rounded-2xl bg-screen-row py-3 text-[11px] font-extrabold text-primary transition-transform", "tap-glow", pressing && "scale-95 bg-warning-soft")}
        >
          <Coach />
          <ChevronUp className={cn("h-4 w-4", !reducedMotion && "animate-bounce")} aria-hidden />
          {screen.label ?? "Swipe up to open"}
        </button>
      </div>
    );
  }

  if (screen.kind === "progress") {
    return <ProgressScreen key={screen.title} title={screen.title} body={screen.body} durationMs={screen.durationMs} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-5 pb-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7" className="draw-check" />
        </svg>
      </span>
      <div className="text-base font-black text-foreground">{screen.title}</div>
      {screen.body && <p className="text-[11px] font-semibold text-muted-foreground">{screen.body}</p>}
      {screen.apps && (
        <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-2">
          {screen.apps.slice(0, 6).map((a, i) => (
            <div key={a} className="flex flex-col items-center gap-1">
              <span className={cn("h-9 w-9 rounded-xl", i === 0 ? "bg-primary" : "bg-primary/30")} />
              <span className="text-[9px] font-bold">{a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressScreen({ title, body, durationMs }: { title: string; body?: string | undefined; durationMs: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 pb-8 text-center" aria-live="polite">
      <Sparkles className="h-8 w-8 text-primary" aria-hidden />
      <div className="text-sm font-extrabold text-foreground">{title}</div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
      {body && <p className="text-[11px] font-semibold text-muted-foreground">{body}</p>}
      <p className="rounded-full bg-warning-soft px-3 py-1 text-[10px] font-extrabold text-warning-foreground">This is normal — it's not frozen</p>
    </div>
  );
}

function HelloWord({ reducedMotion }: { reducedMotion?: boolean | undefined }) {
  const words = ["Hello", "Hola", "Bonjour", "こんにちは"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 1800);
    return () => clearInterval(t);
  }, [reducedMotion, words.length]);
  return (
    <div className="flex flex-col items-center gap-2">
      <span key={words[i]} className="animate-fade-in text-4xl font-black text-foreground">
        {words[i]}
      </span>
      <Wifi className="h-3 w-3 text-muted-foreground" aria-hidden />
    </div>
  );
}

function SettingsGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
