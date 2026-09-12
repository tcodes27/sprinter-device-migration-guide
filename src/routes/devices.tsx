import { createFileRoute, redirect } from "@tanstack/react-router";

/** The device picker now lives on the home page; keep the old link working. */
export const Route = createFileRoute("/devices")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
