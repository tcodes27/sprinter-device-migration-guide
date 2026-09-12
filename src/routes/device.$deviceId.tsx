import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StepView } from "@/components/StepView";
import { DeviceChooser } from "@/components/DeviceChooser";
import { SiteHeader } from "@/components/SiteHeader";
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
        { title: `${name} Migration Steps. Sprinter Health` },
        { name: "description", content: `Tap-along guided steps to update, reset, and set up your Sprinter Health ${name}.` },
        { property: "og:title", content: `${name} Migration Steps. Sprinter Health` },
        { property: "og:description", content: loaderData?.description ?? "Guided device migration steps." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: DevicePage,
});

function DevicePage() {
  const { deviceId } = Route.useParams();
  const progress = useProgress();
  const navigate = useNavigate();
  const id = isDeviceId(deviceId) ? deviceId : "iphone";
  const workflow = workflows[id];
  const p = progress[id];
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (p.path && !p.started) progressActions.start(id);
  }, [id, p.path, p.started]);

  // No path yet: the Sprinter tells us what IT asked before any step is shown.
  if (!p.path) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        {hydrated && <DeviceChooser open device={id} onOpenChange={() => {}} onCancel={() => navigate({ to: "/" })} />}
      </div>
    );
  }

  return <StepView workflow={workflow} progress={p} path={p.path} />;
}
