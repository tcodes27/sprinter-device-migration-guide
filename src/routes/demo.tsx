import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { DeviceCard } from "@/components/DeviceCard";
import { deviceOrder } from "@/content/workflows";
import { progressActions, useProgress } from "@/lib/progress";

const script = [
  "Select a device (try the Patient-Facing iPad — it needs a reset)",
  "Start the workflow",
  "Go backward with Back — completed steps stay checked",
  "Go forward — you continue where you left off",
  "Open “Why?”",
  "Open “Show me” (what should I see?)",
  "Open the floating “Need help?” button",
  "Complete a step with the main button",
  "Tap “Pause / come back later” — progress is saved",
  "Finish all steps to see the completion screen",
];

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo Mode — Sprinter Health Device Migration" },
      { name: "description", content: "Internal demonstration of the Sprinter Health device migration guide using sample data." },
      { property: "og:title", content: "Demo Mode — Sprinter Health Device Migration" },
      { property: "og:description", content: "Sample-data walkthrough for internal demonstration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const progress = useProgress();
  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <header className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-sm font-extrabold uppercase tracking-[0.18em] text-warning-foreground">
            <Sparkles className="h-4 w-4" aria-hidden /> Demo mode · sample data only
          </p>
          <h1 className="text-4xl">Internal demonstration</h1>
          <p className="text-lg text-muted-foreground">Load a sample Sprinter with three devices: iPhone complete, iPad Mini needs an update, Patient-Facing iPad needs a reset. Nothing here is connected to production systems.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button size="xl" onClick={() => progressActions.loadDemo()}>
            Load sample devices <ArrowRight aria-hidden />
          </Button>
          <Button size="xl" variant="outline" onClick={() => progressActions.resetAll()}>
            <RotateCcw aria-hidden /> Clear all progress
          </Button>
        </div>

        <section className="space-y-3">
          {deviceOrder.map((d, i) => (
            <DeviceCard key={d} id={d} progress={progress[d]} index={i} />
          ))}
        </section>

        <section className="card-soft p-6">
          <h2 className="text-2xl">Demo script</h2>
          <ol className="mt-3 space-y-2">
            {script.map((s, i) => (
              <li key={s} className="flex gap-3 text-base font-semibold">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-black text-primary">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <Button asChild variant="soft" size="lg" className="mt-4">
            <Link to="/devices">Go to My Devices</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
