import { Check, ChevronRight, Wifi } from "lucide-react";
import type { Screen } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

type Props = { screen: Screen; frame: "phone" | "tablet" | "tablet-wide"; lookFor?: string; large?: boolean };

/**
 * Illustrated example of a device screen, driven by content.
 * Replace with real screenshots per step when approved images are available.
 */
export function DeviceScreen({ screen, frame, lookFor, large }: Props) {
  const aspect = frame === "phone" ? "aspect-[9/16]" : frame === "tablet" ? "aspect-[3/4]" : "aspect-[4/3]";
  return (
    <div className={cn("mx-auto w-full", large ? "max-w-md" : frame === "phone" ? "max-w-[240px]" : "max-w-xs", frame === "tablet-wide" && !large && "max-w-sm")}>
      <div className={cn("relative overflow-hidden rounded-[1.6rem] border-[6px] border-deep bg-screen shadow-card", aspect)}>
        <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-bold text-muted-foreground">
          <span>9:41</span>
          <Wifi className="h-3 w-3" aria-hidden />
        </div>
        <ScreenBody screen={screen} />
        {lookFor && (
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-warning-soft px-3 py-2 text-xs font-extrabold text-warning-foreground shadow-soft">
            Look for: <span className="font-black">{lookFor}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Highlight({ children, on }: { children: React.ReactNode; on?: boolean | undefined }) {
  return (
    <div className={cn("relative rounded-xl", on && "ring-4 ring-warning ring-offset-2 ring-offset-screen")}>
      {children}
      {on && <span className="sr-only">(this is the one to tap)</span>}
    </div>
  );
}

function ScreenBody({ screen }: { screen: Screen }) {
  if (screen.kind === "list") {
    return (
      <div className="px-3 pt-3">
        <div className="mb-2 px-1 text-sm font-extrabold text-foreground">{screen.title}</div>
        <div className="space-y-1.5">
          {screen.rows.map((r) => (
            <Highlight key={r.label} on={r.highlight}>
              <div className="flex items-center justify-between rounded-xl bg-screen-row px-3 py-2.5 text-xs font-semibold text-foreground">
                <span>
                  {r.label}
                  {r.sub && <span className="block text-[10px] font-medium text-muted-foreground">{r.sub}</span>}
                </span>
                {r.highlight && screen.title.includes("Wi-Fi") ? <Check className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </Highlight>
          ))}
        </div>
      </div>
    );
  }
  if (screen.kind === "message") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-5 pb-14 text-center">
        <div className={cn("font-black text-foreground", screen.title.length < 8 ? "text-4xl" : "text-lg")}>{screen.title}</div>
        {screen.body && <p className="text-xs font-medium text-muted-foreground">{screen.body}</p>}
        {screen.button && (
          <Highlight on={screen.highlight}>
            <div className="rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground">{screen.button}</div>
          </Highlight>
        )}
      </div>
    );
  }
  if (screen.kind === "wait") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-5 pb-14 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </div>
        <div className="text-sm font-extrabold text-foreground">{screen.title}</div>
        {screen.body && <p className="text-xs font-medium text-muted-foreground">{screen.body}</p>}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3 px-4 pt-6">
      {screen.apps.map((a, i) => (
        <Highlight key={a} on={i === 0}>
          <div className="flex flex-col items-center gap-1">
            <div className={cn("h-11 w-11 rounded-xl", i === 0 ? "bg-primary" : "bg-muted-foreground/30")} />
            <span className="text-[9px] font-bold text-foreground">{a}</span>
          </div>
        </Highlight>
      ))}
    </div>
  );
}
