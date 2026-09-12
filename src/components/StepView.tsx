import { useCallback, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Expand, Headset, Info, OctagonAlert, PauseCircle, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeviceScreen } from "./DeviceScreen";
import { DeviceSimulator, type SimPhase } from "./DeviceSimulator";
import { InstructionPanel } from "./InstructionPanel";
import { StepShell } from "./StepShell";
import { HoldToConfirm } from "./HoldToConfirm";
import { TroubleshootDialog } from "./TroubleshootDialog";
import { VersionCheck } from "./VersionCheck";
import { Logo } from "./Logo";
import { authErrorHelp, permissions, resetWarning, supportMessage, testflight } from "@/content/shared";
import { phasesFor, stepsFor } from "@/content/workflows";
import { pathLabels, type DeviceWorkflow, type MigrationPath, type WorkflowStep } from "@/lib/workflow-types";
import { percent, progressActions, type DeviceProgress } from "@/lib/progress";
import { useSupport, useSupportLocation } from "@/lib/support";
import { cn } from "@/lib/utils";

export { ProgressDots } from "./ProgressDots";

type Props = { workflow: DeviceWorkflow; progress: DeviceProgress; path: MigrationPath };

export function StepView({ workflow, progress, path }: Props) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { open: openSupport } = useSupport();
  const steps = stepsFor(workflow, path);
  const total = steps.length;
  const index = Math.min(progress.current, total - 1);
  const step = steps[index]!;
  const phases = phasesFor(workflow, path);
  const [different, setDifferent] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [anotherOpen, setAnotherOpen] = useState(false);
  const [sim, setSim] = useState<{ index: number; phase: SimPhase }>({ index: 0, phase: "ready" });
  const gateNeeded = !!step.resetGate && !progress.gates.includes(step.id);
  const isComplete = step.kind === "complete";
  const isVerify = step.kind === "verify-version";
  const savedDone = progress.simDone.includes(index);
  const verified = progress.verified.includes(index);
  const simDone = savedDone || sim.phase === "done" || !step.sequence;
  const canAdvance = isVerify ? verified : true;
  const isDone = progress.finished && index === total - 1;
  const currentAction = step.sequence && !simDone ? step.sequence[Math.min(sim.index, step.sequence.length - 1)]?.hint : undefined;

  useSupportLocation({
    deviceId: workflow.id,
    deviceName: workflow.name,
    processLabel: pathLabels[path],
    stepNumber: index + 1,
    stepTotal: total,
    stepTitle: gateNeeded ? resetWarning.eyebrow : step.title,
    ...(currentAction ? { currentAction } : {}),
    percent: percent(workflow.id, progress),
    completed: progress.finished,
  });

  const goBack = () => index > 0 && progressActions.goTo(workflow.id, index - 1);
  const goNext = () => {
    if (!canAdvance) return;
    progressActions.completeAndNext(workflow.id, index);
    if (index >= total - 1) setAnotherOpen(true);
  };
  const goToUpdate = () => {
    const i = steps.findIndex((s) => s.id === "update");
    progressActions.goTo(workflow.id, Math.max(0, i));
  };
  const onSimComplete = useCallback(() => progressActions.markSimDone(workflow.id, index), [workflow.id, index]);
  const onSimProgress = useCallback((i: number, phase: SimPhase) => setSim({ index: i, phase }), []);

  if (gateNeeded) {
    return (
      <ResetGate
        workflow={workflow}
        index={index}
        total={total}
        onConfirm={() => progressActions.confirmGate(workflow.id, step.id)}
        onBack={goBack}
        onHelp={() => openSupport({ view: "stop" })}
      />
    );
  }

  const left = step.sequence ? (
    <DeviceSimulator
      sequence={step.sequence}
      frame={workflow.frame}
      resetKey={`${workflow.id}-${step.id}`}
      initiallyDone={savedDone}
      onComplete={onSimComplete}
      onProgress={onSimProgress}
    />
  ) : step.screen ? (
    <DeviceScreen screen={step.screen} frame={workflow.frame} lookFor={step.lookFor} />
  ) : (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="h-8 w-8" aria-hidden />
      </span>
      <p className="text-lg font-extrabold">Device ready</p>
    </div>
  );

  const right = (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : -12 }}
        transition={{ duration: 0.25 }}
        className="space-y-5"
      >
        <header>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
            Step {index + 1} · {workflow.name} · {pathLabels[path]}
          </p>
          <h1 id="step-title" className="mt-1 text-3xl sm:text-4xl">
            {step.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{step.intro}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {step.why && <WhyPopover title={step.why.title} body={step.why.body} />}
            {step.whatNext && <WhyPopover icon="next" label="What happens next?" title="What happens next?" body={step.whatNext} />}
            {(step.sequence || step.screen) && (
              <Button variant="soft" size="sm" onClick={() => setLightbox(true)}>
                <Expand aria-hidden /> Show me bigger
              </Button>
            )}
            {!isComplete && (
              <Button variant="outline" size="sm" onClick={() => setDifferent(true)}>
                <TriangleAlert aria-hidden /> My screen looks different
              </Button>
            )}
          </div>
        </header>

        {workflow.note && index === 0 && (
          <aside className="flex gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-base font-extrabold">{workflow.note.title}</p>
              <ul className="mt-1 space-y-0.5 text-sm font-semibold text-muted-foreground">
                {workflow.note.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {step.kind === "waiting" && <WaitingBanner />}

        {isVerify ? (
          <VersionCheck
            deviceName={workflow.name}
            verified={verified}
            onVerified={() => progressActions.markVerified(workflow.id, index)}
            onBackToUpdate={goToUpdate}
            onShowMe={() => setLightbox(true)}
          />
        ) : step.sequence ? (
          <div>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">What to do</h2>
            <InstructionPanel sequence={step.sequence} index={sim.index} done={simDone} />
          </div>
        ) : (
          step.todo && (
            <ol className="space-y-3">
              {step.todo.map((t, i) => (
                <li key={t} className="flex items-start gap-3 text-lg font-semibold">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-black text-primary">{i + 1}</span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
          )
        )}

        {step.extras?.includes("authError") && (
          <details className="rounded-2xl border border-danger/30 bg-danger-soft p-4">
            <summary className="cursor-pointer text-base font-extrabold text-foreground">Seeing an error or sign-in problem? What does this mean?</summary>
            <p className="mt-2 text-base font-semibold">{authErrorHelp.body}</p>
            <Button variant="destructive" size="lg" className="mt-3" onClick={() => openSupport({ view: "request", issue: "Sign-in or authentication error" })}>
              <Headset aria-hidden /> Contact Field Support
            </Button>
          </details>
        )}
        {step.extras?.includes("testflight") && <TestFlightPanel />}
        {step.extras?.includes("permissions") && <PermissionsPanel />}

        {isComplete && <CompletionPanel workflow={workflow} path={path} />}

        <aside className="rounded-2xl bg-muted/60 p-4">
          <p className="text-base font-extrabold">{supportMessage.title}</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{supportMessage.body}</p>
          <Button variant="soft" size="sm" className="mt-3" onClick={() => openSupport({ view: "menu" })}>
            <Headset aria-hidden /> Contact Field Support
          </Button>
        </aside>
      </motion.div>
    </AnimatePresence>
  );

  const bottom = (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <Button variant="ghost" size="lg" onClick={goBack} disabled={index === 0} aria-label="Back">
        <ArrowLeft aria-hidden /> <span className="hidden sm:inline">Back</span>
      </Button>
      <div className="flex min-w-0 flex-col items-stretch gap-1">
        <Button
          size="xl"
          variant={isComplete ? "success" : simDone && canAdvance ? "default" : "outline"}
          onClick={goNext}
          disabled={!canAdvance}
          className={cn("relative overflow-hidden transition-all", simDone && canAdvance && !isComplete && "shadow-float")}
        >
          <AnimatePresence initial={false}>
            {simDone && canAdvance && (
              <motion.span key="check" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} className="flex">
                <Check aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="truncate">{isDone ? "Finish this device" : step.nextLabel}</span>
          <ArrowRight aria-hidden />
        </Button>
        {isVerify && !verified && <span className="hidden text-center text-xs font-bold text-muted-foreground sm:block">Answer the version question above to continue</span>}
        {!isVerify && !simDone && !isComplete && <span className="hidden text-center text-xs font-bold text-muted-foreground sm:block">Finish the practice device, or tap above if you already did this</span>}
      </div>
      <Button asChild variant="ghost" size="lg" className="max-sm:col-span-2 max-sm:mr-40 max-sm:justify-self-start max-sm:h-10">
        <Link to="/" aria-label="Pause — progress saved">
          <PauseCircle aria-hidden /> <span>Pause<span className="hidden sm:inline"> · progress saved</span></span>
        </Link>
      </Button>
    </div>
  );

  return (
    <StepShell deviceName={workflow.name} pathLabel={pathLabels[path]} phases={phases} currentPhase={step.phase ?? "Step"} index={index} total={total} completed={progress.completed} left={left} right={right} bottom={bottom}>
      <TroubleshootDialog open={different} onOpenChange={setDifferent} answers={step.troubleshoot} />
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl p-6">
          <DialogHeader className="text-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Step {index + 1} · practice device</p>
            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
            <DialogDescription className="text-base">{step.intro}</DialogDescription>
          </DialogHeader>
          {step.sequence ? (
            <DeviceSimulator sequence={step.sequence} frame={workflow.frame} resetKey={`big-${step.id}`} large onComplete={onSimComplete} />
          ) : step.screen ? (
            <DeviceScreen screen={step.screen} frame={workflow.frame} lookFor={step.lookFor} large />
          ) : null}
          <Button size="xl" variant="outline" onClick={() => setLightbox(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <AnotherDeviceDialog open={anotherOpen} onOpenChange={setAnotherOpen} deviceName={workflow.name} onYes={() => navigate({ to: "/", search: { choose: true } })} onNo={() => navigate({ to: "/complete" })} />
    </StepShell>
  );
}

/* ---------------- pieces ---------------- */

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

function ResetGate({ workflow, index, total, onConfirm, onBack, onHelp }: { workflow: DeviceWorkflow; index: number; total: number; onConfirm: () => void; onBack: () => void; onHelp: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-screen flex-col bg-warning-soft/40">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/" aria-label="Home">
          <Logo />
        </Link>
        <span className="rounded-full bg-card px-3 py-1 text-sm font-extrabold text-primary shadow-soft">
          Step {index + 1} of {total}
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <motion.section
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-soft w-full max-w-xl space-y-6 border-warning/50 p-6 sm:p-8"
          aria-labelledby="step-title"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning-foreground">
              <ShieldAlert className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-warning-foreground">{resetWarning.eyebrow}</p>
              <h1 id="step-title" className="text-3xl">
                {resetWarning.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-success-soft p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-base font-extrabold">
              {resetWarning.updated} <span className="font-semibold text-muted-foreground">{resetWarning.next}</span>
            </p>
          </div>
          <p className="text-lg font-semibold">{resetWarning.body}</p>
          <div className="rounded-2xl bg-muted p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Device</p>
            <p className="mt-1 text-xl font-black text-primary">{workflow.name}</p>
            <p className="text-base text-muted-foreground">{workflow.description}</p>
          </div>
          <p className="flex items-center gap-2 text-base font-extrabold text-danger">
            <OctagonAlert aria-hidden /> {resetWarning.unsure}
          </p>
          <div className="grid gap-3">
            <HoldToConfirm label={resetWarning.confirm} onConfirm={onConfirm} />
            <Button size="xl" variant="outline" onClick={onBack}>
              <ArrowLeft aria-hidden /> {resetWarning.back}
            </Button>
            <Button size="lg" variant="ghost" onClick={onHelp}>
              <Headset aria-hidden /> {resetWarning.help}
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function TestFlightPanel() {
  const { open } = useSupport();
  const [mode, setMode] = useState<"install" | "update" | null>(null);
  const steps = mode === "install" ? testflight.install : mode === "update" ? testflight.update : null;
  return (
    <details className="rounded-2xl border bg-muted/40 p-4">
      <summary className="cursor-pointer text-base font-extrabold">Need to install or update the Sprinter Health app?</summary>
      <p className="mt-2 text-base font-semibold text-muted-foreground">{testflight.what}</p>
      <p className="mt-2 rounded-2xl bg-primary-soft p-3 text-sm font-bold">{testflight.rule}</p>
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
      <p className="mt-3 flex gap-2 text-sm font-semibold text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {testflight.installVsUpdate}
      </p>
      <div className="mt-4 rounded-2xl border border-warning/40 bg-warning-soft p-4">
        <p className="text-base font-extrabold">{testflight.redeemCode.title}</p>
        <p className="text-base font-semibold">{testflight.redeemCode.warning}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-base font-semibold">
          {testflight.redeemCode.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold">{testflight.redeemCode.still}</span>
          <Button size="sm" onClick={() => open({ view: "request", issue: "TestFlight / redeem code problem" })}>
            <Headset aria-hidden /> Contact Field Support
          </Button>
        </div>
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

function CompletionPanel({ workflow, path }: { workflow: DeviceWorkflow; path: MigrationPath }) {
  const { open } = useSupport();
  const [conn, setConn] = useState<"yes" | "no" | null>(null);
  const [other, setOther] = useState<"yes" | "no" | null>(null);
  return (
    <div className="space-y-5">
      <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="rounded-2xl bg-success-soft p-5">
        <p className="flex items-center gap-2 text-xl font-black text-foreground">
          <Sparkles className="text-success" aria-hidden /> {workflow.name} is ready
        </p>
        <p className="text-sm font-bold text-muted-foreground">{pathLabels[path]}</p>
        <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }} className="mt-3 space-y-2">
          {workflow.completionChecklist[path].map((c) => (
            <motion.li key={c} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3 text-base font-extrabold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-success-foreground">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              {c}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      <div className="rounded-2xl border p-4">
        <p className="text-lg font-extrabold">How is your device working? Are you having any connectivity problems?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant={conn === "no" ? "success" : "outline"} size="lg" onClick={() => setConn("no")}>No — everything is working</Button>
          <Button variant={conn === "yes" ? "warning" : "outline"} size="lg" onClick={() => setConn("yes")}>Yes — I'm having problems</Button>
        </div>
        {conn === "yes" && (
          <div className="mt-3 rounded-2xl bg-warning-soft p-4">
            <p className="text-base font-extrabold">Please tell Field Support before finishing your migration.</p>
            <Button size="lg" className="mt-3" onClick={() => open({ view: "request", issue: "Connectivity problem after migration" })}>
              <Headset aria-hidden /> Report a connectivity issue
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
            <Button size="lg" className="mt-3" onClick={() => open({ view: "request", issue: "Other device or app problem" })}>
              <Headset aria-hidden /> Report an issue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnotherDeviceDialog({ open, onOpenChange, deviceName, onYes, onNo }: { open: boolean; onOpenChange: (o: boolean) => void; deviceName: string; onYes: () => void; onNo: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="text-left">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="h-7 w-7" aria-hidden />
          </motion.span>
          <DialogTitle className="text-2xl">You finished this device.</DialogTitle>
          <DialogDescription className="text-base">{deviceName} is done. Do you need to update another device?</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 pt-2">
          <Button size="xl" onClick={onYes}>
            Yes — choose another device <ArrowRight aria-hidden />
          </Button>
          <Button size="xl" variant="success" onClick={onNo}>
            No — I'm done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Keep type import referenced for content authors who extend step panels.
export type { WorkflowStep };
