import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowDown, ArrowRight, LifeBuoy, MailOpen, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { HelpButton } from "@/components/HelpButton";
import { DeviceCard } from "@/components/DeviceCard";
import { journey, whyMigration } from "@/content/shared";
import { deviceOrder } from "@/content/workflows";
import { summary, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sprinter Health Device Migration Guide" },
      { name: "description", content: "A simple, step-by-step guide to update, reset, and set up your Sprinter Health iPhone and iPads for the new system." },
      { property: "og:title", content: "Sprinter Health Device Migration Guide" },
      { property: "og:description", content: "Step-by-step help to get your Sprinter Health devices ready." },
    ],
  }),
  component: Index,
});

function Index() {
  const progress = useProgress();
  const { done, total } = summary(progress);
  const anyStarted = deviceOrder.some((d) => progress[d].started);

  return (
    <div className="min-h-screen pb-28">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-soft space-y-4 p-6 sm:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Welcome</p>
          <h1 className="text-4xl sm:text-5xl">Let's get your Sprinter Health devices ready.</h1>
          <p className="text-lg text-muted-foreground">{whyMigration.headline}</p>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-muted p-4 text-center">
            <div className="rounded-xl bg-card p-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground shadow-soft">Old system</div>
            <ArrowRight className="text-primary" aria-hidden />
            <div className="rounded-xl bg-primary p-3 text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-soft">New system</div>
          </div>

          <div className="grid gap-3">
            <Button asChild size="xl">
              <Link to="/devices">
                {anyStarted ? "Continue my device guide" : "Start my device guide"} <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link to="/help">
                <LifeBuoy aria-hidden /> I need help
              </Link>
            </Button>
          </div>
        </motion.section>

        <section className="card-soft space-y-4 p-6">
          <h2 className="text-2xl">Why are we doing this?</h2>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">What does migration mean?</p>
            <p className="mt-1 text-lg font-semibold">{whyMigration.whatIsMigration}</p>
          </div>
          <p className="text-lg text-muted-foreground">{whyMigration.needsSteps}</p>
          <ol className="flex flex-col items-center gap-1" aria-label="What your device will go through">
            {journey.map((j, i) => (
              <li key={j} className="flex flex-col items-center">
                <span className={i === 0 || i === journey.length - 1 ? "rounded-full bg-primary px-5 py-2 text-base font-extrabold uppercase tracking-wide text-primary-foreground" : "rounded-full bg-primary-soft px-5 py-2 text-base font-extrabold uppercase tracking-wide text-primary"}>
                  {j}
                </span>
                {i < journey.length - 1 && <ArrowDown className="my-1 h-5 w-5 text-muted-foreground" aria-hidden />}
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-warning/40 bg-warning-soft p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-warning-foreground">
              <TriangleAlert aria-hidden /> Important
            </p>
            <p className="mt-2 text-lg font-bold">{whyMigration.important}</p>
            <p className="mt-2 text-base text-muted-foreground">{whyMigration.whyItMatters}</p>
          </div>
          <div className="rounded-2xl border bg-primary-soft p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
              <LifeBuoy aria-hidden /> Having other problems?
            </p>
            <p className="mt-2 text-lg font-bold">{whyMigration.otherProblems}</p>
            <Button asChild variant="soft" size="lg" className="mt-3 bg-card">
              <Link to="/help">Tell IT about a problem</Link>
            </Button>
          </div>
        </section>

        <section className="card-soft space-y-3 p-6">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
            <MailOpen aria-hidden /> How you'll be asked
          </p>
          <p className="text-lg font-semibold">{whyMigration.howYouAreAsked}</p>
          <ul className="flex flex-wrap gap-2">
            {whyMigration.requestChannels.map((c) => (
              <li key={c} className="rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-muted-foreground">{c}</li>
            ))}
          </ul>
          <p className="text-base text-muted-foreground">{whyMigration.whenAsked}</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl">My devices</h2>
            <span className="text-sm font-extrabold text-muted-foreground">{done} of {total} complete</span>
          </div>
          {deviceOrder.map((d, i) => (
            <DeviceCard key={d} id={d} progress={progress[d]} index={i} />
          ))}
        </section>

        <p className="text-center text-xs font-semibold text-muted-foreground">
          <Link to="/demo" className="underline underline-offset-4">Demo mode</Link> for internal demonstration
        </p>
      </main>
      <HelpButton />
    </div>
  );
}
