import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { HelpButton } from "@/components/HelpButton";
import { DeviceCard } from "@/components/DeviceCard";
import { deviceOrder } from "@/content/workflows";
import { summary, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "My Devices — Sprinter Health Device Migration" },
      { name: "description", content: "Choose which Sprinter Health device you are working on and see your migration progress." },
      { property: "og:title", content: "My Devices — Sprinter Health Device Migration" },
      { property: "og:description", content: "Choose your device and continue where you left off." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const progress = useProgress();
  const { done, total, allDone } = summary(progress);
  const nextDevice = deviceOrder.find((d) => !progress[d].finished);

  return (
    <div className="min-h-screen pb-28">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <header className="space-y-2">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">My devices</p>
          <h1 className="text-4xl">Which device are you working on?</h1>
          <p className="text-lg text-muted-foreground">Pick the device IT asked you to update. Your progress is saved, so you can switch devices any time.</p>
        </header>

        <section className="card-soft p-5" aria-label="Your migration progress">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Your migration progress</p>
            <p className="text-lg font-black text-primary">{done} of {total} devices complete</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
            <motion.div className="h-full rounded-full bg-success" initial={{ width: 0 }} animate={{ width: `${(done / total) * 100}%` }} transition={{ duration: 0.6 }} />
          </div>
          {allDone ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex items-center gap-3 rounded-2xl bg-success-soft p-4">
              <PartyPopper className="h-8 w-8 text-success" aria-hidden />
              <div>
                <p className="text-xl font-black text-foreground">All devices complete</p>
                <p className="text-base font-semibold text-muted-foreground">Your required device migration steps are finished.</p>
              </div>
            </motion.div>
          ) : (
            done > 0 && nextDevice && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-bold">You have {total - done} device{total - done === 1 ? "" : "s"} left.</p>
                <Button asChild size="lg">
                  <Link to="/device/$deviceId" params={{ deviceId: nextDevice }}>Continue <ArrowRight aria-hidden /></Link>
                </Button>
              </div>
            )
          )}
        </section>

        <section className="space-y-3">
          {deviceOrder.map((d, i) => (
            <DeviceCard key={d} id={d} progress={progress[d]} index={i} />
          ))}
        </section>
        <p className="text-center text-sm font-semibold text-muted-foreground">You can come back later. Your progress will be saved.</p>
      </main>
      <HelpButton />
    </div>
  );
}
