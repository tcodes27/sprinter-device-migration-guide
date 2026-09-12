import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { StepView } from "@/components/StepView";
import { isDeviceId, workflows } from "@/content/workflows";
import { progressActions, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/device/$deviceId")({
  loader: ({ params }) => {
    if (!isDeviceId(params.deviceId)) throw notFound();
    return { name: workflows[params.deviceId].name, description: workflows[params.deviceId].description };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Device";
    return {
      meta: [
        { title: `${name} Migration Steps — Sprinter Health` },
        { name: "description", content: `Guided steps to update, reset, and set up your Sprinter Health ${name}.` },
        { property: "og:title", content: `${name} Migration Steps — Sprinter Health` },
        { property: "og:description", content: loaderData?.description ?? "Guided device migration steps." },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: DevicePage,
});

function DevicePage() {
  const { deviceId } = Route.useParams();
  const progress = useProgress();
  const id = isDeviceId(deviceId) ? deviceId : "iphone";
  const workflow = workflows[id];
  const p = progress[id];

  useEffect(() => {
    if (!p.started) progressActions.start(id);
  }, [id, p.started]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>
          <div className="text-right">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Working on</p>
            <p className="text-lg font-black text-primary">{workflow.name}</p>
          </div>
        </div>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pb-3">
          <p className="rounded-full bg-primary-soft px-3 py-1 text-sm font-extrabold text-primary">
            Step {Math.min(p.current, workflow.steps.length - 1) + 1} of {workflow.steps.length}
          </p>
          <Button asChild variant="ghost" size="sm">
            <Link to="/devices">My devices</Link>
          </Button>
        </div>
      </header>
      <StepView workflow={workflow} progress={p} />
    </div>
  );
}
