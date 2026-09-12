import { createFileRoute } from "@tanstack/react-router";
import { OctagonAlert } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { ReportIssueForm } from "@/components/ReportIssueForm";
import { stopRules, supportMessage } from "@/content/shared";

const searchSchema = z.object({ issue: z.enum(["connectivity", "other"]).optional() });

export const Route = createFileRoute("/help")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Need Help? — Sprinter Health Device Migration" },
      { name: "description", content: "When to stop and contact Field Support, and how to tell IT about a device problem." },
      { property: "og:title", content: "Need Help? — Sprinter Health Device Migration" },
      { property: "og:description", content: "Stop, don't guess — contact Field Support." },
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
      </main>
    </div>
  );
}
