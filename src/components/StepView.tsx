import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Expand, OctagonAlert, PauseCircle, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeviceScreen } from "./DeviceScreen";
import { TroubleshootDialog } from "./TroubleshootDialog";
import { HelpButton } from "./HelpButton";
import { authErrorHelp, permissions, resetWarning, supportMessage, testflight } from "@/content/shared";
import type { DeviceWorkflow, WorkflowStep } from "@/lib/workflow-types";
import { progressActions, type DeviceProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Props = { workflow: DeviceWorkflow; progress: DeviceProgress };

export function StepView({ workflow, progress }: Props) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const index = Math.min(progress.current, workflow.steps.length - 1);
  const step = workflow.steps[index]!;
  const total = workflow.steps.length;
  const [different, setDifferent] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const gateNeeded = !!step.resetGate && !progress.gates.includes(step.id);

  const goBack = () => index > 0 && progressActions.goTo(workflow.id, index - 1);
  const goNext = () => {
    progressActions.completeAndNext(workflow.id, index);
    if (index >= total - 1) navigate({ to: "/devices" });
  };
  const isDone = progress.finished && index === total - 1;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-4">
      {/* Orientation */}
      <div className="card-soft mb-4 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">You are here</p>
        <p className="mt-1 text-base font-bold text-foreground">
          Device Migration <span className="text-muted-foreground">→</span> <span className="text-primary">{workflow.name}</span> <span className="text-muted-foreground">→</span> Step {index + 1} of {total}
        </p>
        <ProgressDots total={total} current={index} completed={progress.completed} />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={`${step.id}-${gateNeeded}`}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -12 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="step-title"
        >
          {gateNeeded ? (
            <ResetGate workflow={workflow} onConfirm={() => progressActions.confirmGate(workflow.id, step.id)} />
          ) : (
            <div className="card-soft space-y-6 p-5 sm:p-7">
              <header>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
                  Step {index + 1} · {workflow.name}
                </p>
                <h1 id="step-title" className="mt-1 text-3xl sm:text-4xl">
                  {step.title}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">{step.intro}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.why && <WhyPopover title={step.why.title} body={step.why.body} />}
                  {step.whatNext && <WhyPopover icon="next" label="What happens next?" title="What happens next?" body={step.whatNext} />}
                </div>
              </header>

              {step.kind === "waiting" && <WaitingBanner />}

              {step.todo && (
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">What to do</h2>
                  <ol className="mt-3 space-y-3">
                    {step.todo.map((t, i) => (
                      <li key={t} className="flex items-start gap-3 text-lg font-semibold">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-black text-primary">{i + 1}</span>
                        <span className="pt-0.5">{t}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {step.screen && (
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">What you should see</h2>
                  <button type="button" onClick={() => setLightbox(true)} className="mt-3 w-full rounded-2xl bg-muted p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40" aria-label="Show me a larger example">
                    <DeviceScreen screen={step.screen} frame={workflow.frame} lookFor={step.lookFor} />
                    <span className="mt-3 inline-flex items-center gap-2 text-base font-extrabold text-primary">
                      <Expand aria-hidden /> Show me
                    </span>
                  </button>
                </div>
              )}

              {step.extras?.includes("authError") && (
                <details className="rounded-2xl border border-danger/30 bg-danger-soft p-4">
                  <summary className="cursor-pointer text-base font-extrabold text-foreground">Seeing an error or sign-in problem? What does this mean?</summary>
                  <p className="mt-2 text-base font-semibold">{authErrorHelp.body}</p>
                  <Button asChild variant="destructive" size="lg" className="mt-3">
                    <Link to="/help">Contact Field Support</Link>
                  </Button>
                </details>
              )}
              {step.extras?.includes("testflight") && <TestFlightPanel />}
              {step.extras?.includes("permissions") && <PermissionsPanel />}

              {step.kind === "complete" && <CompletionPanel workflow={workflow} />}

              {/* Actions */}
              <div className="grid gap-3 border-t pt-6">
                <Button size="xl" variant={step.kind === "complete" ? "success" : "default"} onClick={goNext}>
                  {step.screen && step.kind !== "complete" ? <Check aria-hidden /> : null}
                  {isDone ? "Back to my devices" : step.nextLabel}
                  <ArrowRight aria-hidden />
                </Button>
                {step.kind !== "complete" && (
                  <Button size="xl" variant="outline" onClick={() => setDifferent(true)}>
                    <TriangleAlert aria-hidden /> My screen looks different
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* Back / Pause */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="lg" onClick={goBack} disabled={index === 0}>
          <ArrowLeft aria-hidden /> Back
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link to="/devices">
            <PauseCircle aria-hidden /> Pause / come back later
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-muted-foreground">You can come back later. Your progress is saved.</p>

      <aside className="card-soft mt-8 p-5">
        <h2 className="text-lg">{supportMessage.title}</h2>
        <p className="mt-1 text-base text-muted-foreground">{supportMessage.body}</p>
        <Button asChild variant="soft" size="lg" className="mt-3">
          <Link to="/help">Contact Field Support</Link>
        </Button>
      </aside>

      <TroubleshootDialog open={different} onOpenChange={setDifferent} answers={step.troubleshoot} />
      <Lightbox open={lightbox} onOpenChange={setLightbox} step={step} index={index} workflow={workflow} onNext={() => { setLightbox(false); goNext(); }} />
      <HelpButton location={`Step ${index + 1} — ${step.title}`} answers={step.troubleshoot} />
    </div>
  );
}

/* ---------------- pieces ---------------- */

export function ProgressDots({ total, current, completed, compact }: { total: number; current: number; completed: number[]; compact?: boolean }) {
  return (
    <ol className={cn("mt-3 flex items-center", compact ? "gap-1" : "gap-1.5")} aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const done = completed.includes(i) && i !== current;
        const isCurrent = i === current;
        return (
          <li key={i} className="flex flex-1 items-center">
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-colors",
                compact ? "h-3 w-3" : "h-6 w-6",
                done && "bg-success text-success-foreground",
                isCurrent && "bg-primary text-primary-foreground pulse-current",
                !done && !isCurrent && "border-2 border-border bg-card",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {!compact && (done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1)}
              <span className="sr-only">{done ? "complete" : isCurrent ? "current" : "not started"}</span>
            </span>
            {i < total - 1 && <span className={cn("h-1 flex-1 rounded-full", done ? "bg-success" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}

function WhyPopover({ title, body, label = "Why?", icon = "why" }: { title: string; body: string; label?: string; icon?: "why" | "next" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="soft" size="sm">
          {icon === "why" ? <CircleHelp aria-hidden /> : <Sparkles aria-hidden />} {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl p-5 shadow-float" align="start">
        <h3 className="text-lg">{title}</h3>
        <p className="mt-2 text-base font-semibold text-muted-foreground">{body}</p>
        <PopoverTrigger asChild>
          <Button size="lg" className="mt-4 w-full">
            Got it
          </Button>
        </PopoverTrigger>
      </PopoverContent>
    </Popover>
  );
}

function WaitingBanner() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-primary-soft p-4">
      <div className="relative h-12 w-12 shrink-0">
        <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      <div>
        <p className="text-base font-extrabold">Your device is being configured.</p>
        <p className="text-sm font-semibold text-muted-foreground">Please keep the device connected to power and do not restart it unless instructed. It is not frozen.</p>
      </div>
    </div>
  );
}

function ResetGate({ workflow, onConfirm }: { workflow: DeviceWorkflow; onConfirm: () => void }) {
  return (
    <div className="card-soft space-y-6 border-warning/40 p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-warning-foreground">
          <ShieldAlert aria-hidden />
        </span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-warning-foreground">Important</p>
          <h1 id="step-title" className="text-3xl">
            {resetWarning.title}
          </h1>
        </div>
      </div>
      <p className="text-lg font-semibold">{resetWarning.body}</p>
      <div className="rounded-2xl bg-muted p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Confirm your device</p>
        <p className="mt-1 text-xl font-black text-primary">{workflow.name}</p>
        <p className="text-base text-muted-foreground">{workflow.description}. This is the device IT asked you to update.</p>
      </div>
      <p className="flex items-center gap-2 text-base font-extrabold text-danger">
        <OctagonAlert aria-hidden /> {resetWarning.unsure}
      </p>
      <div className="grid gap-3">
        <Button size="xl" variant="warning" onClick={onConfirm}>
          <Check aria-hidden /> {resetWarning.confirm}
        </Button>
        <Button asChild size="xl" variant="outline">
          <Link to="/help">{resetWarning.help}</Link>
        </Button>
      </div>
    </div>
  );
}

function TestFlightPanel() {
  const [mode, setMode] = useState<"install" | "update" | null>(null);
  const steps = mode === "install" ? testflight.install : mode === "update" ? testflight.update : null;
  return (
    <details className="rounded-2xl border bg-muted/40 p-4">
      <summary className="cursor-pointer text-base font-extrabold">Need to install or update the Sprinter Health app?</summary>
      <p className="mt-2 text-base font-semibold text-muted-foreground">{testflight.what}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button variant={mode === "install" ? "default" : "outline"} size="lg" onClick={() => setMode("install")}>
          Install app
        </Button>
        <Button variant={mode === "update" ? "default" : "outline"} size="lg" onClick={() => setMode("update")}>
          Update app
        </Button>
      </div>
      {steps && (
        <ol className="mt-4 space-y-2">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-base font-semibold">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-black text-primary">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      )}
      <div className="mt-4 rounded-2xl border border-warning/40 bg-warning-soft p-4">
        <p className="text-base font-extrabold">{testflight.redeemCode.title}</p>
        <p className="text-base font-semibold">{testflight.redeemCode.warning}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-base font-semibold">
          {testflight.redeemCode.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}

function PermissionsPanel() {
  return (
    <details className="rounded-2xl border bg-muted/40 p-4">
      <summary className="cursor-pointer text-base font-extrabold">The app is asking for permissions?</summary>
      <p className="mt-2 text-base font-semibold text-muted-foreground">These permissions help the app work correctly.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {permissions.map((p) => (
          <div key={p.name} className="rounded-2xl bg-card p-4 shadow-soft">
            <p className="text-lg font-black text-primary">{p.name}</p>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">What it does</p>
            <p className="text-sm font-semibold">{p.does}</p>
            <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">What to tap</p>
            <p className="text-sm font-semibold">{p.tap}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function CompletionPanel({ workflow }: { workflow: DeviceWorkflow }) {
  const [conn, setConn] = useState<"yes" | "no" | null>(null);
  const [other, setOther] = useState<"yes" | "no" | null>(null);
  return (
    <div className="space-y-5">
      <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="space-y-2">
        {workflow.completionChecklist.map((c) => (
          <motion.li key={c} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3 rounded-2xl bg-success-soft px-4 py-3 text-lg font-extrabold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check aria-hidden />
            </span>
            {c}
          </motion.li>
        ))}
      </motion.ul>

      <div className="rounded-2xl border p-4">
        <p className="text-lg font-extrabold">How is your device working? Are you having any connectivity problems?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant={conn === "no" ? "success" : "outline"} size="lg" onClick={() => setConn("no")}>No — everything is working</Button>
          <Button variant={conn === "yes" ? "warning" : "outline"} size="lg" onClick={() => setConn("yes")}>Yes — I'm having problems</Button>
        </div>
        {conn === "yes" && (
          <div className="mt-3 rounded-2xl bg-warning-soft p-4">
            <p className="text-base font-extrabold">Please tell Field Support before finishing your migration.</p>
            <Button asChild size="lg" className="mt-3">
              <Link to="/help" search={{ issue: "connectivity" }}>Report a connectivity issue</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-4">
        <p className="text-lg font-extrabold">Are you having any other problems with your Sprinter Health devices or apps?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant={other === "no" ? "success" : "outline"} size="lg" onClick={() => setOther("no")}>No</Button>
          <Button variant={other === "yes" ? "warning" : "outline"} size="lg" onClick={() => setOther("yes")}>Yes</Button>
        </div>
        {other === "yes" && (
          <div className="mt-3 rounded-2xl bg-warning-soft p-4">
            <p className="text-base font-extrabold">This is a good time to let IT know. Please tell us what is happening so we can address it.</p>
            <Button asChild size="lg" className="mt-3">
              <Link to="/help">Report an issue</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Lightbox({ open, onOpenChange, step, index, workflow, onNext }: { open: boolean; onOpenChange: (o: boolean) => void; step: WorkflowStep; index: number; workflow: DeviceWorkflow; onNext: () => void }) {
  if (!step.screen) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="text-left">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Step {index + 1} · What to look for</p>
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base">{step.intro}</DialogDescription>
        </DialogHeader>
        <DeviceScreen screen={step.screen} frame={workflow.frame} lookFor={step.lookFor} large />
        {step.lookFor && (
          <p className="rounded-2xl bg-warning-soft p-3 text-center text-base font-extrabold">
            Look for: <span className="font-black">“{step.lookFor}”</span>
          </p>
        )}
        <div className="grid gap-2">
          <Button size="xl" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {step.kind !== "complete" && (
            <Button size="xl" onClick={onNext}>
              I see this — next step <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
