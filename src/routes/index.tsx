import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { z } from "zod";
import { ArrowRight, Check, CircleHelp, Headset, PartyPopper, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { DeviceLauncher } from "@/components/DeviceLauncher";
import { DeviceChooser } from "@/components/DeviceChooser";
import { ProgressRing } from "@/components/ProgressRing";
import { StorageNotice } from "@/components/StorageNotice";
import { journey, whyMigration } from "@/content/shared";
import { deviceOrder, workflows } from "@/content/workflows";
import { deviceStatus, summary, totalSteps, useProgress } from "@/lib/progress";
import { useSupport, useSupportLocation } from "@/lib/support";
import type { DeviceId } from "@/lib/workflow-types";

const searchSchema = z.object({ choose: z.boolean().optional() });

export const Route = createFileRoute("/")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sprinter Health Device Migration Guide" },
      { name: "description", content: "Tap-along, step-by-step guide to update, reset, and set up your Sprinter Health iPhone and iPads for the new system." },
      { property: "og:title", content: "Sprinter Health Device Migration Guide" },
      { property: "og:description", content: "Pick your device and follow along on a practice screen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const progress = useProgress();
  const navigate = useNavigate();
  const { choose } = Route.useSearch();
  const { open: openSupport } = useSupport();
  const { done, total, allDone } = summary(progress);
  const started = deviceOrder.filter((d) => progress[d].path && progress[d].started && !progress[d].finished);
  const resume = started[0];
  const [chooserOpen, setChooserOpen] = useState(false);
  const [presetDevice, setPresetDevice] = useState<DeviceId | null>(null);

  useSupportLocation({ deviceName: "Home, no device selected", completed: allDone, percent: Math.round((done / total) * 100) });

  useEffect(() => {
    if (choose) {
      setPresetDevice(null);
      setChooserOpen(true);
      navigate({ to: "/", search: {}, replace: true });
    }
  }, [choose, navigate]);

  const onSelect = (id: DeviceId) => {
    if (progress[id].path) {
      navigate({ to: "/device/$deviceId", params: { deviceId: id } });
    } else {
      setPresetDevice(id);
      setChooserOpen(true);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-8 px-4 pt-8">
        <StorageNotice />
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Device migration</p>
            <h1 className="mt-1 text-4xl sm:text-5xl">Let's get your devices ready.</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Pick the device IT asked you to update. You'll follow along on a practice screen, one tap at a time, and Field Support is one tap away the whole time.{" "}
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-0.5 align-middle text-sm font-extrabold text-primary hover:bg-accent">
                    <CircleHelp className="h-4 w-4" aria-hidden /> What is this?
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-3xl p-6">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl">Why are we doing this?</DialogTitle>
                    <DialogDescription className="text-base">{whyMigration.headline}</DialogDescription>
                  </DialogHeader>
                  <p className="text-base font-semibold">{whyMigration.whatIsMigration}</p>
                  <ol className="flex flex-wrap items-center gap-2" aria-label="What your device will go through">
                    {journey.map((j, i) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">{j}</span>
                        {i < journey.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
                      </li>
                    ))}
                  </ol>
                  <p className="rounded-2xl bg-warning-soft p-3 text-sm font-bold text-warning-foreground">{whyMigration.important}</p>
                  <Button asChild variant="soft" size="lg">
                    <Link to="/help">More help</Link>
                  </Button>
                </DialogContent>
              </Dialog>
            </p>
          </div>
          <div className="flex items-center gap-3 justify-self-start rounded-2xl bg-card px-4 py-3 shadow-soft sm:justify-self-end">
            <ProgressRing value={Math.round((done / total) * 100)} size={56} stroke={6} tone={allDone ? "success" : "primary"} label="Overall progress" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">My migration progress</p>
              <p className="text-lg font-black text-primary">
                {done} of {total} devices complete
              </p>
            </div>
          </div>
        </motion.section>

        {allDone ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-wrap items-center gap-3 rounded-2xl bg-success-soft p-5">
            <PartyPopper className="h-8 w-8 text-success" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black">All devices complete</p>
              <p className="text-base font-semibold text-muted-foreground">Your required device migration steps are finished.</p>
            </div>
            <Button asChild size="lg" variant="success">
              <Link to="/complete">
                See summary <ArrowRight aria-hidden />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3">
            <Button
              size="xl"
              className="w-full shadow-float sm:w-auto"
              onClick={() => {
                setPresetDevice(null);
                setChooserOpen(true);
              }}
            >
              <Smartphone aria-hidden /> Choose your device <ArrowRight aria-hidden />
            </Button>
            {resume && (
              <Button asChild size="xl" variant="soft" className="w-full sm:w-auto">
                <Link to="/device/$deviceId" params={{ deviceId: resume }}>
                  Continue · {workflows[resume].name}, step {Math.min(progress[resume].current, totalSteps(resume, progress[resume]) - 1) + 1}
                </Link>
              </Button>
            )}
          </motion.div>
        )}

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Your devices">
          {deviceOrder.map((d, i) => (
            <DeviceLauncher key={d} id={d} progress={progress[d]} index={i} onSelect={onSelect} />
          ))}
        </section>

        <ul className="card-soft divide-y p-2" aria-label="Device status list">
          {deviceOrder.map((d) => {
            const s = deviceStatus(progress[d]);
            return (
              <li key={d} className="flex items-center justify-between gap-3 px-3 py-2.5 text-base font-extrabold">
                <span>{workflows[d].name}</span>
                <span className={s === "complete" ? "flex items-center gap-1 text-success" : s === "in-progress" ? "text-primary" : "text-warning-foreground"}>
                  {s === "complete" && <Check className="h-5 w-5" aria-hidden />}
                  {s === "complete" ? "Complete" : s === "in-progress" ? "In progress" : "Needs update"}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-soft p-4">
          <p className="text-base font-bold">Something's already wrong with a device? You're not on your own.</p>
          <Button variant="soft" size="lg" className="bg-card" onClick={() => openSupport({ view: "menu" })}>
            <Headset aria-hidden /> Talk to Field Support
          </Button>
        </div>

        <p className="text-center text-xs font-semibold text-muted-foreground">
          Sprinter Health staff only:{" "}
          <Link to="/demo" className="underline underline-offset-4">Internal demo mode</Link> (sample data, not part of your migration)
        </p>
      </main>

      <DeviceChooser open={chooserOpen} onOpenChange={setChooserOpen} device={presetDevice} />
    </div>
  );
}
