import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { DeviceLauncher } from "@/components/DeviceLauncher";
import { deviceOrder } from "@/content/workflows";
import { hasProgress, progressActions, useProgress } from "@/lib/progress";

const script = [
  "Tap “Choose your device”, pick a device, then answer “What did IT ask you to do?”",
  "Choose Update + Reset, press and hold to confirm it matches the IT message",
  "Tap the glowing spot on the practice device to move through the screens",
  "Tap somewhere wrong, the device wiggles and shows “Tap here”",
  "Press “Watch me do it” to see it auto-play, then try it yourself",
  "Watch the sub-actions check themselves off on the right",
  "Notice the Next button fill in once the practice device is done",
  "After the update, answer the version check (try “It does not match”)",
  "Reach the reset step, “Check one more time” gate, press and hold to confirm",
  "Tap the floating “Need help?”, try Chat, Text, and “I can't continue” (all demo)",
  "Tap “Pause”, progress and practice-device completion are saved",
  "Finish all steps → connectivity check → “Do you need to update another device?”",
  "Finish every device to reach the “You're all set” screen",
];

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo Mode. Sprinter Health Device Migration" },
      { name: "description", content: "Internal demonstration of the Sprinter Health device migration guide using sample data." },
      { property: "og:title", content: "Demo Mode. Sprinter Health Device Migration" },
      { property: "og:description", content: "Sample-data walkthrough for internal demonstration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const progress = useProgress();
  const navigate = useNavigate();
  const anyProgress = deviceOrder.some((d) => hasProgress(progress[d]));
  const [pending, setPending] = useState<"load" | "clear" | null>(null);

  const run = (action: "load" | "clear") => {
    if (action === "load") progressActions.loadDemo();
    else progressActions.resetAll();
    setPending(null);
  };
  const request = (action: "load" | "clear") => (anyProgress ? setPending(action) : run(action));

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 pt-6">
        <header className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-sm font-extrabold uppercase tracking-[0.18em] text-warning-foreground">
            <Sparkles className="h-4 w-4" aria-hidden /> Internal demo mode · sample data only
          </p>
          <h1 className="text-4xl">Internal demonstration</h1>
          <p className="text-lg text-muted-foreground">For Sprinter Health staff demonstrations, not part of the normal device workflow. Load a sample Sprinter with three devices: iPhone complete, iPad Mini needs an update, Patient-Facing iPad needs a reset. Nothing here is connected to production systems.</p>
          <p className="rounded-2xl bg-warning-soft p-3 text-sm font-bold text-warning-foreground">Loading sample data replaces whatever progress is currently saved in this browser.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button size="xl" onClick={() => request("load")}>
            Load sample devices <ArrowRight aria-hidden />
          </Button>
          <Button size="xl" variant="outline" onClick={() => request("clear")}>
            <RotateCcw aria-hidden /> Clear all progress
          </Button>
        </div>

        <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{pending === "load" ? "Replace saved progress with sample data?" : "Erase all saved progress?"}</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {pending === "load"
                  ? "This browser already has device progress saved. Loading the sample devices will replace it and it cannot be brought back."
                  : "This will erase the saved progress for every device in this browser. It cannot be brought back."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my progress</AlertDialogCancel>
              <AlertDialogAction onClick={() => pending && run(pending)}>{pending === "load" ? "Replace with sample data" : "Erase everything"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <section className="grid gap-4 sm:grid-cols-3">
          {deviceOrder.map((d, i) => (
            <DeviceLauncher key={d} id={d} progress={progress[d]} index={i} onSelect={(id) => navigate({ to: "/device/$deviceId", params: { deviceId: id } })} />
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
            <Link to="/">Go to device picker</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
