import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { deviceImages } from "./DeviceChooser";
import { workflows } from "@/content/workflows";
import { deviceStatus, percent, totalSteps, type DeviceProgress } from "@/lib/progress";
import { pathLabels, type DeviceId } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

type Props = { id: DeviceId; progress: DeviceProgress; index?: number; onSelect: (id: DeviceId) => void };

/** Large tappable device tile with a progress ring and a plain-language status. */
export function DeviceLauncher({ id, progress, index = 0, onSelect }: Props) {
  const wf = workflows[id];
  const status = deviceStatus(progress);
  const pct = percent(id, progress);
  const total = totalSteps(id, progress);
  const stepNo = Math.min(progress.current, total - 1) + 1;
  const statusText = status === "complete" ? "Complete" : status === "in-progress" ? "In progress" : "Needs update";

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.3 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }} className="h-full">
      <button
        type="button"
        onClick={() => onSelect(id)}
        className={cn(
          "card-soft group relative flex h-full w-full flex-col items-center gap-3 p-6 text-center transition-shadow hover:shadow-float focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
          status === "complete" && "border-success/40 bg-success-soft/40",
        )}
        aria-label={`${wf.name}: ${statusText}${status === "in-progress" ? `, ${pct}% done, continue at step ${stepNo}` : ""}`}
      >
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide",
            status === "complete" ? "bg-success text-success-foreground" : status === "in-progress" ? "bg-primary-soft text-primary" : "bg-warning-soft text-warning-foreground",
          )}
        >
          {status === "complete" && <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden />}
          {statusText}
        </span>
        <div className="relative mt-4">
          <img src={deviceImages[id]} alt="" width={768} height={768} loading="lazy" className="h-32 w-32 object-contain transition-transform group-hover:scale-105 sm:h-36 sm:w-36" />
          <div className="absolute -bottom-2 -right-2 rounded-full bg-card p-1 shadow-soft">
            {status === "complete" ? (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground">
                <Check className="h-7 w-7" aria-hidden />
              </span>
            ) : (
              <ProgressRing value={pct} size={56} stroke={6} label={`${wf.name} progress`} />
            )}
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-2xl">{wf.name}</h3>
          <p className="text-sm font-semibold text-muted-foreground">{wf.description}</p>
          {progress.path && <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-primary">{pathLabels[progress.path]}</p>}
        </div>
        <span
          className={cn(
            "mt-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold",
            status === "complete" ? "bg-card text-success" : status === "in-progress" ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          {status === "complete" ? "Done — review" : status === "in-progress" ? `Continue · step ${stepNo} of ${total}` : "Start"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </button>
    </motion.div>
  );
}
