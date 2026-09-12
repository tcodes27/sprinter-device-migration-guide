import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, CircleHelp, Headset, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approvedSoftwareVersion, versionCheck } from "@/content/config";
import { useSupport } from "@/lib/support";
import { cn } from "@/lib/utils";

type Answer = "matches" | "noMatch" | "dontKnow" | null;

type Props = {
  deviceName: string;
  verified: boolean;
  onVerified: () => void;
  onBackToUpdate: () => void;
  onShowMe: () => void;
};

/** "Update complete?" — the Sprinter confirms the version. The app never assumes the update worked. */
export function VersionCheck({ deviceName, verified, onVerified, onBackToUpdate, onShowMe }: Props) {
  const [answer, setAnswer] = useState<Answer>(verified ? "matches" : null);
  const { open } = useSupport();
  const instruction = approvedSoftwareVersion ? versionCheck.approvedInstruction(approvedSoftwareVersion) : versionCheck.fallbackInstruction;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary-soft p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">On your {deviceName}, go to</p>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-lg font-black">
          {versionCheck.path.map((p, i) => (
            <span key={p} className="flex items-center gap-1">
              {p}
              {i < versionCheck.path.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
            </span>
          ))}
        </p>
        <p className="mt-2 text-base font-semibold">{versionCheck.lookFor}</p>
        <p className="mt-1 text-base font-extrabold">{instruction}</p>
      </div>

      <p className="text-lg font-extrabold">{versionCheck.question}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Choice active={answer === "matches"} tone="success" icon={<Check aria-hidden />} label={versionCheck.matches} onClick={() => { setAnswer("matches"); onVerified(); }} />
        <Choice active={answer === "noMatch"} tone="warning" icon={<X aria-hidden />} label={versionCheck.noMatch} onClick={() => setAnswer("noMatch")} />
        <Choice active={answer === "dontKnow"} tone="primary" icon={<CircleHelp aria-hidden />} label={versionCheck.dontKnow} onClick={() => { setAnswer("dontKnow"); onShowMe(); }} />
      </div>

      <AnimatePresence mode="wait">
        {answer === "matches" && (
          <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-2xl bg-success-soft p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-base font-extrabold">Great — your {deviceName} is updated. Use the button below to continue.</p>
          </motion.div>
        )}
        {answer === "noMatch" && (
          <motion.div key="no" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 rounded-2xl bg-warning-soft p-4">
            <p className="text-base font-extrabold">That's okay. The update may not have finished. Let's try once more.</p>
            <ol className="space-y-1 pl-5 text-base font-semibold" style={{ listStyle: "decimal" }}>
              {versionCheck.noMatchHelp.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ol>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button size="lg" onClick={onBackToUpdate}>
                <RotateCcw aria-hidden /> Go back to the update step
              </Button>
              <Button size="lg" variant="outline" onClick={() => open({ view: "request", issue: "Software version does not match after update" })}>
                <Headset aria-hidden /> Contact Field Support
              </Button>
            </div>
          </motion.div>
        )}
        {answer === "dontKnow" && (
          <motion.div key="dk" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 rounded-2xl bg-muted/70 p-4">
            <p className="text-base font-extrabold">No problem. The practice screen on the left shows where the version appears. Compare it with your IT instructions, then answer again.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button size="lg" variant="soft" onClick={onShowMe}>
                Show me on the practice device
              </Button>
              <Button size="lg" variant="outline" onClick={() => open({ view: "chat" })}>
                <Headset aria-hidden /> Ask Field Support
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Choice({ active, tone, icon, label, onClick }: { active: boolean; tone: "success" | "warning" | "primary"; icon: React.ReactNode; label: string; onClick: () => void }) {
  const activeCls = { success: "border-success bg-success-soft", warning: "border-warning bg-warning-soft", primary: "border-primary bg-primary-soft" }[tone];
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 bg-card px-4 text-base font-extrabold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40", active ? activeCls : "border-border")}>
      {icon} {label}
    </button>
  );
}
