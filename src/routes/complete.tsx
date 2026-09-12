import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Check, Headset, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { support as supportCopy } from "@/content/config";
import { deviceOrder, workflows } from "@/content/workflows";
import { summary, useProgress } from "@/lib/progress";
import { useSupport, useSupportLocation } from "@/lib/support";
import { pathLabels } from "@/lib/workflow-types";

export const Route = createFileRoute("/complete")({
  head: () => ({
    meta: [
      { title: "You're All Set — Sprinter Health Device Migration" },
      { name: "description", content: "Your Sprinter Health devices are migrated. What to expect next and how to reach Field Support if anything comes up." },
      { property: "og:title", content: "You're All Set — Sprinter Health Device Migration" },
      { property: "og:description", content: "Device migration complete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompletePage,
});

function CompletePage() {
  const progress = useProgress();
  const { done, total, allDone } = summary(progress);
  const { open } = useSupport();
  useSupportLocation({ deviceName: "All devices", completed: true, percent: Math.round((done / total) * 100) });

  return (
    <div className="min-h-screen pb-28">
      <SiteHeader />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-8 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success text-success-foreground">
          {allDone ? <PartyPopper className="h-12 w-12" aria-hidden /> : <Check className="h-12 w-12" aria-hidden />}
        </motion.span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Device migration</p>
          <h1 className="mt-1 text-4xl sm:text-5xl">{allDone ? "You're all set!" : "Nice work so far"}</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {allDone ? "Your devices are now ready for the new Sprinter Health system." : `${done} of ${total} devices complete. Finish the rest whenever IT asked you to.`}
          </p>
          <p className="mt-2 text-base font-semibold">{supportCopy.followUpEmail}</p>
        </div>

        <ul className="card-soft space-y-2 p-5 text-left" aria-label="Device status">
          {deviceOrder.map((d) => {
            const p = progress[d];
            return (
              <li key={d} className="flex items-center justify-between gap-3 text-base font-extrabold">
                <span>
                  {workflows[d].name}
                  {p.path && <span className="ml-2 text-sm font-semibold text-muted-foreground">{pathLabels[p.path]}</span>}
                </span>
                {p.finished ? <span className="flex items-center gap-1 text-success"><Check className="h-5 w-5" aria-hidden /> Complete</span> : <span className="text-muted-foreground">{p.path ? "In progress" : "Not started"}</span>}
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl bg-primary-soft p-4 text-left">
          <p className="text-base font-extrabold">If anything seems off, we're still here.</p>
          <p className="text-sm font-semibold text-muted-foreground">Field Support can help after the migration too — you never have to guess.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild size="xl" variant={allDone ? "success" : "default"}>
            <Link to="/">
              {allDone ? "Done" : "Back to my devices"} <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button size="xl" variant="outline" onClick={() => open({ view: "after" })}>
            <Headset aria-hidden /> I need help
          </Button>
        </div>
      </main>
    </div>
  );
}
