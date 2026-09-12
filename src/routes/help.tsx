import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MailOpen, OctagonAlert, TriangleAlert } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { ReportIssueForm } from "@/components/ReportIssueForm";
import { journey, stopRules, supportMessage, whyMigration } from "@/content/shared";

const searchSchema = z.object({ issue: z.enum(["connectivity", "other"]).optional() });

export const Route = createFileRoute("/help")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Need Help?. Sprinter Health Device Migration" },
      { name: "description", content: "When to stop and contact Field Support, why the migration is happening, and how to tell IT about a device problem." },
      { property: "og:title", content: "Need Help?. Sprinter Health Device Migration" },
      { property: "og:description", content: "Stop, don't guess, contact Field Support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { issue } = Route.useSearch();
  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <header className="space-y-2">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Need help?</p>
          <h1 className="text-4xl">{supportMessage.title}</h1>
          <p className="text-lg text-muted-foreground">{supportMessage.body}</p>
        </header>

        <section className="rounded-2xl border border-danger/30 bg-danger-soft p-6">
          <h2 className="flex items-center gap-2 text-2xl text-danger">
            <OctagonAlert aria-hidden /> Stop if:
          </h2>
          <ul className="mt-3 space-y-2">
            {stopRules.map((r) => (
              <li key={r} className="flex items-start gap-3 text-lg font-semibold">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-danger" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xl font-black">Do not guess. Contact Field Support.</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{supportMessage.note}</p>
        </section>

        <ReportIssueForm issueType={issue} />

        <details className="card-soft p-6">
          <summary className="cursor-pointer text-2xl font-extrabold text-heading">Why are we doing this?</summary>
          <div className="mt-4 space-y-4">
            <p className="text-lg text-muted-foreground">{whyMigration.headline}</p>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">What does migration mean?</p>
              <p className="mt-1 text-lg font-semibold">{whyMigration.whatIsMigration}</p>
            </div>
            <p className="text-lg text-muted-foreground">{whyMigration.needsSteps}</p>
            <ol className="flex flex-wrap items-center gap-2" aria-label="What your device will go through">
              {journey.map((j, i) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-primary">{j}</span>
                  {i < journey.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
                </li>
              ))}
            </ol>
            <div className="rounded-2xl border border-warning/40 bg-warning-soft p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-warning-foreground">
                <TriangleAlert aria-hidden /> Important
              </p>
              <p className="mt-2 text-base font-bold">{whyMigration.important}</p>
              <p className="mt-1 text-sm text-muted-foreground">{whyMigration.whyItMatters}</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                <MailOpen aria-hidden /> How you'll be asked
              </p>
              <p className="mt-2 text-base font-semibold">{whyMigration.howYouAreAsked}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {whyMigration.requestChannels.map((c) => (
                  <li key={c} className="rounded-full bg-card px-3 py-1 text-sm font-bold text-muted-foreground">{c}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">{whyMigration.whenAsked}</p>
            </div>
          </div>
        </details>
      </main>
    </div>
  );
}
