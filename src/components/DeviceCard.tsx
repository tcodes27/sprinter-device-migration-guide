import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Check, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workflows } from "@/content/workflows";
import { deviceStatus, type DeviceProgress } from "@/lib/progress";
import type { DeviceId } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";
import iphone from "@/assets/device-iphone.png";
import ipadMini from "@/assets/device-ipad-mini.png";
import ipadPatient from "@/assets/device-ipad-patient.png";

const images: Record<DeviceId, string> = { iphone, "ipad-mini": ipadMini, "patient-ipad": ipadPatient };

export function DeviceCard({ id, progress, index = 0 }: { id: DeviceId; progress: DeviceProgress; index?: number }) {
  const wf = workflows[id];
  const status = deviceStatus(progress);
  const total = wf.steps.length;
  const doneCount = progress.finished ? total : progress.completed.length;

  const badge =
    status === "complete"
      ? { label: "Complete", cls: "bg-success-soft text-success", icon: Check }
      : status === "in-progress"
        ? { label: `Needs action · ${doneCount} of ${total} steps`, cls: "bg-warning-soft text-warning-foreground", icon: CircleDot }
        : { label: "Not started", cls: "bg-muted text-muted-foreground", icon: CircleDot };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileTap={{ scale: 0.99 }}
      className="card-soft flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
    >
      <img src={images[id]} alt={`${wf.name} illustration`} width={768} height={768} loading="lazy" className="mx-auto h-28 w-28 shrink-0 object-contain sm:mx-0" />
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-2xl">{wf.name}</h3>
        <p className="text-base text-muted-foreground">{wf.description}</p>
        <span className={cn("mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold", badge.cls)}>
          <badge.icon className="h-4 w-4" aria-hidden /> {badge.label}
        </span>
        {status === "in-progress" && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={total}>
            <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${(doneCount / total) * 100}%` }} />
          </div>
        )}
      </div>
      <Button asChild size="lg" variant={status === "complete" ? "outline" : "default"} className="w-full sm:w-auto">
        <Link to="/device/$deviceId" params={{ deviceId: id }}>
          {status === "complete" ? "Review" : status === "in-progress" ? "Continue" : wf.startLabel}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </motion.article>
  );
}
