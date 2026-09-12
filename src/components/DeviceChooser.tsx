import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Eraser, RefreshCw, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { HoldToConfirm } from "./HoldToConfirm";
import { deviceChooser, pathChoice } from "@/content/shared";
import { deviceOrder, workflows } from "@/content/workflows";
import { hasProgress, progressActions, useProgress } from "@/lib/progress";
import { pathLabels, type DeviceId, type MigrationPath } from "@/lib/workflow-types";
import { useSupport } from "@/lib/support";
import { cn } from "@/lib/utils";
import iphone from "@/assets/device-iphone.png";
import ipadMini from "@/assets/device-ipad-mini.png";
import ipadPatient from "@/assets/device-ipad-patient.png";

export const deviceImages: Record<DeviceId, string> = { iphone, "ipad-mini": ipadMini, "patient-ipad": ipadPatient };

type Stage = "device" | "action" | "confirm";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Skip the device stage when the device is already known */
  device?: DeviceId | null;
  /** Called when the chooser is dismissed without choosing (used by the device route) */
  onCancel?: () => void;
};

/**
 * Device → "What did IT ask you to do?" → (reset confirmation) → route.
 * The app never decides update vs reset; the Sprinter tells us what IT said.
 */
export function DeviceChooser({ open, onOpenChange, device: preset = null, onCancel }: Props) {
  const navigate = useNavigate();
  const { open: openSupport } = useSupport();
  const progress = useProgress();
  const [device, setDevice] = useState<DeviceId | null>(preset);
  const [stage, setStage] = useState<Stage>(preset ? "action" : "device");
  /** A different path was chosen for a device that already has progress; waiting for an explicit decision. */
  const [pendingPath, setPendingPath] = useState<MigrationPath | null>(null);

  useEffect(() => {
    if (open) {
      setDevice(preset);
      setStage(preset ? "action" : "device");
      setPendingPath(null);
    }
  }, [open, preset]);

  const wf = device ? workflows[device] : null;

  const leave = () => {
    if (!device) return;
    onOpenChange(false);
    navigate({ to: "/device/$deviceId", params: { deviceId: device } });
  };

  const go = (path: MigrationPath) => {
    if (!device) return;
    const saved = progress[device];
    // Never silently wipe progress: switching paths on a device with progress needs a confirmation first.
    if (saved.path && saved.path !== path && hasProgress(saved)) {
      setPendingPath(path);
      return;
    }
    progressActions.setPath(device, path);
    leave();
  };

  const currentPath = device ? progress[device].path : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) onCancel?.();
      }}
    >
      <DialogContent className={cn("max-h-[92vh] overflow-y-auto rounded-3xl p-6", stage === "device" ? "max-w-2xl" : "max-w-lg", stage === "confirm" && "border-warning/50")}>
        <AnimatePresence mode="wait" initial={false}>
          {stage === "device" && (
            <motion.div key="device" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
              <DialogHeader className="text-left">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Step 1 of 2</p>
                <DialogTitle className="text-3xl">{deviceChooser.title}</DialogTitle>
                <DialogDescription className="text-base">{deviceChooser.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-3">
                {deviceOrder.map((d) => (
                  <motion.button
                    key={d}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setDevice(d);
                      setStage("action");
                    }}
                    className="card-soft flex flex-col items-center gap-2 p-4 text-center hover:shadow-float focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
                  >
                    <img src={deviceImages[d]} alt="" width={768} height={768} className="h-24 w-24 object-contain" />
                    <span className="text-lg font-black">{workflows[d].name}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{workflows[d].description}</span>
                  </motion.button>
                ))}
              </div>
              <p className="rounded-2xl bg-warning-soft p-3 text-sm font-bold text-warning-foreground">Important: {deviceChooser.important}</p>
            </motion.div>
          )}

          {stage === "action" && wf && (
            <motion.div key="action" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
              <DialogHeader className="text-left">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Step 2 of 2 · {wf.name}</p>
                <DialogTitle className="text-3xl">{pathChoice.question}</DialogTitle>
                <DialogDescription className="text-base">{pathChoice.hint}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <ChoiceButton icon={<RefreshCw className="h-7 w-7" aria-hidden />} title={pathChoice.update.title} body={pathChoice.update.body} onClick={() => go("update")} />
                <ChoiceButton icon={<Eraser className="h-7 w-7" aria-hidden />} title={pathChoice.reset.title} body={pathChoice.reset.body} tone="warning" onClick={() => setStage("confirm")} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {!preset ? (
                  <Button variant="ghost" size="lg" onClick={() => setStage("device")}>
                    <ArrowLeft aria-hidden /> Different device
                  </Button>
                ) : (
                  <span />
                )}
                <Button variant="soft" size="lg" onClick={() => openSupport({ view: "chat" })}>
                  I'm not sure what IT asked
                </Button>
              </div>
            </motion.div>
          )}

          {stage === "confirm" && wf && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <DialogHeader className="text-left">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning-foreground">
                    <ShieldAlert className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-warning-foreground">{pathChoice.confirm.eyebrow}</p>
                    <DialogTitle className="text-2xl">{pathChoice.confirm.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="pt-2 text-base">{pathChoice.confirm.body}</DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Device</p>
                <p className="text-xl font-black text-primary">{wf.name}</p>
                <p className="mt-2 text-base font-extrabold text-danger">{pathChoice.confirm.warning}</p>
              </div>
              <div className="grid gap-2">
                <HoldToConfirm label={pathChoice.confirm.yes} onConfirm={() => go("update-reset")} />
                <Button variant="outline" size="lg" onClick={() => setStage("action")}>
                  <ArrowLeft aria-hidden /> {pathChoice.confirm.back}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AlertDialog open={pendingPath !== null} onOpenChange={(o) => !o && setPendingPath(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Start over with a different path?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {wf?.name} already has progress saved for {currentPath ? pathLabels[currentPath] : "its current path"}. Changing to{" "}
                {pendingPath ? pathLabels[pendingPath] : "the new path"} restarts this device from the beginning, and the progress and checkpoints for{" "}
                {currentPath ? pathLabels[currentPath] : "the current path"} will be cleared. Other devices are not affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setPendingPath(null);
                  leave();
                }}
              >
                Keep current path
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!device || !pendingPath) return;
                  progressActions.setPath(device, pendingPath);
                  setPendingPath(null);
                  leave();
                }}
              >
                Start over with {pendingPath ? pathLabels[pendingPath] : "new path"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceButton({ icon, title, body, tone = "primary", onClick }: { icon: React.ReactNode; title: string; body: string; tone?: "primary" | "warning"; onClick: () => void }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onClick} className="card-soft flex items-center gap-4 p-4 text-left hover:shadow-float focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40">
      <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", tone === "primary" ? "bg-primary-soft text-primary" : "bg-warning-soft text-warning-foreground")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-black">{title}</span>
        <span className="block text-base font-semibold text-muted-foreground">{body}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </motion.button>
  );
}

export { pathLabels };
