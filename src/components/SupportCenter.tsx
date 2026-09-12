import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Check,
  Headset,
  LifeBuoy,
  MessageCircle,
  MessageSquareText,
  OctagonAlert,
  Send,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { support as supportCopy } from "@/content/config";
import { useSupport, type SupportLocation, type SupportView } from "@/lib/support";
import { cn } from "@/lib/utils";

/**
 * The one Field Support surface for the whole app.
 * Floating "Need help?" button + a dialog that never touches progress:
 * closing it returns the Sprinter to exactly where they were.
 */
export function SupportCenter() {
  const { isOpen, open, close, view, setView, issue, setIssue, location } = useSupport();
  const router = useRouter();
  const [launcherDismissed, setLauncherDismissed] = useState(false);

  useEffect(() => {
    return router.subscribe("onResolved", () => setLauncherDismissed(false));
  }, [router]);

  const titleFor: Record<SupportView, string> = {
    menu: "Need help?",
    after: "What is happening?",
    chat: "Field Support",
    request: "Your support request is ready.",
    stop: "Stop, let's get help",
    sent: "Support request created",
  };

  return (
    <>
      <AnimatePresence>
        {!launcherDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="fixed bottom-24 right-3 z-40 flex overflow-hidden rounded-full bg-primary shadow-float sm:bottom-5 sm:right-4"
          >
            <Button
              type="button"
              size="sm"
              onClick={() => open({ view: location?.completed ? "after" : "menu" })}
              className="min-h-12 gap-1.5 rounded-none rounded-l-full px-3 shadow-none sm:min-h-14 sm:px-4 sm:text-base"
              aria-label="Need help? Contact Field Support"
            >
              <LifeBuoy aria-hidden />
              <span className="sm:hidden">Help</span>
              <span className="hidden sm:inline">Need help?</span>
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={() => setLauncherDismissed(true)}
              className="h-auto min-h-12 w-11 rounded-none rounded-r-full border-l border-primary-foreground/30 px-0 shadow-none sm:min-h-14 sm:w-12"
              aria-label="Hide floating Help button on this page"
            >
              <X aria-hidden />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={(o) => (o ? open() : close())}>
        <DialogContent
          hideClose
          className={cn(
            "grid max-h-[94dvh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-t-3xl p-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 sm:max-h-[92vh] sm:rounded-3xl",
            view === "chat" ? "max-w-lg" : "max-w-md",
          )}
        >
          <div
            className={cn(
              "border-b px-5 pb-4 pt-5 sm:px-6 sm:pt-6",
              view === "stop" && "rounded-t-3xl bg-danger-soft",
            )}
          >
            <DialogHeader className="text-left">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                  Field Support
                </p>
                <div className="flex items-center gap-2 pr-7">
                  <DemoBadge />
                  <Button variant="ghost" size="sm" className="h-10 px-2" onClick={close}>
                    <X aria-hidden /> Close
                  </Button>
                </div>
              </div>
              <DialogTitle className="text-2xl">{titleFor[view]}</DialogTitle>
              <DialogDescription className="text-base">
                {view === "menu" && "That's okay. Field Support can help you."}
                {view === "after" && "Tell us what's going on and we'll route it to Field Support."}
                {view === "chat" && "A prototype of live chat. Pick what's happening."}
                {view === "request" &&
                  "We've filled in where you are so you don't have to explain."}
                {view === "stop" &&
                  "You don't need to guess or keep trying. Field Support can take it from here."}
                {view === "sent" &&
                  "Field Support will contact you shortly. You can keep your device where it is."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-y-auto px-5 pb-6 pt-4 sm:px-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {view === "menu" && (
                  <MenuView location={location} onPick={setView} onClose={close} />
                )}
                {view === "after" && (
                  <AfterView
                    onPick={(i) => {
                      setIssue(i);
                      setView("request");
                    }}
                    onClose={close}
                  />
                )}
                {view === "chat" && (
                  <ChatView
                    location={location}
                    onRequest={(i) => {
                      setIssue(i);
                      setView("request");
                    }}
                    onClose={close}
                  />
                )}
                {view === "request" && (
                  <RequestView
                    location={location}
                    issue={issue}
                    onIssue={setIssue}
                    onSend={() => setView("sent")}
                    onBack={close}
                  />
                )}
                {view === "stop" && (
                  <StopView
                    location={location}
                    onContact={() => {
                      setIssue("I can't continue");
                      setView("request");
                    }}
                    onBack={close}
                  />
                )}
                {view === "sent" && <SentView onClose={close} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------- pieces ---------------- */

function DemoBadge() {
  return (
    <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-warning-foreground">
      {supportCopy.demoBadge}
    </span>
  );
}

function LocationCard({
  location,
  compact = false,
}: {
  location: SupportLocation | null;
  compact?: boolean;
}) {
  if (!location) {
    return (
      <div className="rounded-2xl bg-muted/70 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
          You are here
        </p>
        <p className="mt-1 text-base font-extrabold">Device migration home</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-muted/70 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
        You are here
      </p>
      <dl
        className={cn(
          "mt-2 grid gap-x-4 gap-y-1 text-base",
          compact ? "grid-cols-1" : "grid-cols-[auto_1fr]",
        )}
      >
        <Row k="Device" v={location.deviceName} />
        {location.processLabel && <Row k="Process" v={location.processLabel} />}
        {location.stepNumber && location.stepTotal && (
          <Row
            k="Step"
            v={`${location.stepNumber} of ${location.stepTotal}${location.stepTitle ? `, ${location.stepTitle}` : ""}`}
          />
        )}
        {location.currentAction && <Row k="Action" v={location.currentAction} />}
        {typeof location.percent === "number" && (
          <Row k="Progress" v={`${location.percent}% complete`} />
        )}
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="font-bold text-muted-foreground">{k}</dt>
      <dd className="font-extrabold">{v}</dd>
    </>
  );
}

function MenuView({
  location,
  onPick,
  onClose,
}: {
  location: SupportLocation | null;
  onPick: (v: SupportView) => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <LocationCard location={location} />
      <div className="grid gap-2">
        <Button
          size="xl"
          variant="outline"
          className="justify-start"
          onClick={() => onPick("chat")}
        >
          <MessageCircle aria-hidden /> Chat with Field Support
        </Button>
        <Button
          size="xl"
          variant="outline"
          className="justify-start"
          onClick={() => onPick("request")}
        >
          <MessageSquareText aria-hidden /> Text Field Support
        </Button>
        <Button
          size="xl"
          variant="destructive"
          className="justify-start"
          onClick={() => onPick("stop")}
        >
          <OctagonAlert aria-hidden /> I can't continue
        </Button>
      </div>
      <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
        <ArrowLeft aria-hidden /> Back to what I was doing
      </Button>
      <p className="text-center text-xs font-semibold text-muted-foreground">
        Your progress is saved. Nothing resets when you ask for help.
      </p>
    </div>
  );
}

const afterOptions = [
  "My device is not working correctly",
  "I'm not sure if I did everything right",
  "I'm having connectivity problems",
  "Something else",
];

function AfterView({ onPick, onClose }: { onPick: (issue: string) => void; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {afterOptions.map((o) => (
          <Button
            key={o}
            size="xl"
            variant="outline"
            className="justify-start whitespace-normal text-left"
            onClick={() => onPick(o)}
          >
            {o}
          </Button>
        ))}
      </div>
      <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
        <ArrowLeft aria-hidden /> Never mind
      </Button>
    </div>
  );
}

type Msg = { from: "support" | "me"; text: string };

const quick: { label: string; reply: string }[] = [
  {
    label: "I don't understand this step",
    reply:
      "No problem. Read the “What to do” list one line at a time and do only that line. Tap “Why?” if you want to know the reason. Want me to open a request so a person can walk you through it?",
  },
  {
    label: "My screen looks different",
    reply:
      "That happens, devices can show slightly different screens. Look for the words in bold on the practice device. If you can't find them within a minute, stop and I'll get a person on it.",
  },
  {
    label: "My device is stuck",
    reply:
      "Give it two full minutes and keep it plugged in, some steps take longer than they look and the device is not frozen. If nothing changes after that, don't restart it. Request Field Support and we'll take over.",
  },
  {
    label: "Something else",
    reply:
      "Okay. The fastest way is to send a request. I've already noted your device and step, so you only need to add a sentence about what's happening.",
  },
];

function ChatView({
  location,
  onRequest,
  onClose,
}: {
  location: SupportLocation | null;
  onRequest: (issue: string) => void;
  onClose: () => void;
}) {
  const where = location?.stepNumber
    ? `You're on step ${location.stepNumber} of ${location.stepTotal}, ${location.stepTitle}.`
    : location
      ? `You're working on your ${location.deviceName}.`
      : "You're on the device migration home screen.";
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "support", text: "Hi! I'm here to help. 👋" },
    { from: "support", text: `${where} What's happening?` },
  ]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [lastIssue, setLastIssue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, typing]);

  const send = (text: string, reply: string) => {
    setMsgs((m) => [...m, { from: "me", text }]);
    setLastIssue(text);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "support", text: reply }]);
    }, 900);
  };

  return (
    <div className="space-y-3">
      <div
        className="max-h-72 space-y-2 overflow-y-auto rounded-2xl bg-muted/60 p-3"
        aria-live="polite"
      >
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
          >
            <p
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-base font-semibold",
                m.from === "me"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-card shadow-soft",
              )}
            >
              {m.text}
            </p>
          </motion.div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <span
              className="flex gap-1 rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-soft"
              aria-label="Field Support is typing"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-muted-foreground"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2">
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => send(q.label, q.reply)}
            className="rounded-full border bg-card px-3 py-1.5 text-sm font-extrabold text-primary hover:bg-primary-soft"
          >
            {q.label}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          send(
            draft.trim(),
            "Thanks. I've noted that. If you'd like a person to take it from here, tap “Request Field Support” and I'll include what you wrote.",
          );
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message Field Support"
          className="min-h-12 flex-1 rounded-2xl border bg-card px-4 text-base font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
        />
        <Button type="submit" size="lg" aria-label="Send">
          <Send aria-hidden />
        </Button>
      </form>

      <div className="grid gap-2 pt-1">
        <Button size="xl" onClick={() => onRequest(lastIssue || "Chat follow-up")}>
          <Headset aria-hidden /> Request Field Support
        </Button>
        <Button variant="soft" size="lg" onClick={onClose}>
          <ArrowLeft aria-hidden /> Go back to my step
        </Button>
      </div>
      <p className="text-center text-xs font-semibold text-muted-foreground">
        {supportCopy.demoNote}
      </p>
    </div>
  );
}

function RequestView({
  location,
  issue,
  onIssue,
  onSend,
  onBack,
}: {
  location: SupportLocation | null;
  issue: string;
  onIssue: (s: string) => void;
  onSend: () => void;
  onBack: () => void;
}) {
  const [message, setMessage] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [shot, setShot] = useState(false);
  const stepText = location?.stepNumber
    ? `Step ${location.stepNumber} of ${location.stepTotal}${location.stepTitle ? `, ${location.stepTitle}` : ""}`
    : location?.completed
      ? "Migration complete"
      : "Home";

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Field label="Device" value={location?.deviceName ?? "Not selected yet"} />
        <Field
          label="Current step"
          value={location?.currentAction ? `${stepText} · ${location.currentAction}` : stepText}
        />
        <div className="rounded-2xl bg-muted/70 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
            Issue
          </p>
          <input
            value={issue}
            onChange={(e) => onIssue(e.target.value)}
            placeholder="What's happening?"
            aria-label="Issue"
            className="mt-1 w-full bg-transparent text-base font-extrabold focus-visible:outline-none"
          />
        </div>
      </div>

      {showMsg ? (
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything else Field Support should know?"
          className="min-h-24 rounded-2xl text-base font-semibold"
        />
      ) : (
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start"
          onClick={() => setShowMsg(true)}
        >
          <MessageSquareText aria-hidden /> Add a message
        </Button>
      )}

      <Button
        variant={shot ? "soft" : "outline"}
        size="lg"
        className="w-full justify-start"
        onClick={() => setShot((s) => !s)}
        aria-pressed={shot}
      >
        {shot ? <Check aria-hidden /> : <Camera aria-hidden />}{" "}
        {shot ? "Screenshot attached (demo)" : "Attach screenshot"}
      </Button>

      <div className="grid gap-2">
        <Button size="xl" onClick={onSend} disabled={!issue.trim()}>
          <Send aria-hidden /> Request help
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft aria-hidden /> Back to my step
        </Button>
      </div>
      <p className="text-center text-xs font-semibold text-muted-foreground">
        {supportCopy.demoNote}
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/70 p-3">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold">{value}</p>
    </div>
  );
}

function StopView({
  location,
  onContact,
  onBack,
}: {
  location: SupportLocation | null;
  onContact: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 pt-4">
      <LocationCard location={location} />
      <p className="text-base font-semibold">
        Leave your device exactly as it is. Don't restart it, and don't guess at the next step.
      </p>
      <div className="grid gap-2">
        <Button size="xl" variant="destructive" onClick={onContact}>
          <Headset aria-hidden /> Contact Field Support
        </Button>
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft aria-hidden /> Go back
        </Button>
      </div>
    </div>
  );
}

function SentView({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground"
      >
        <Check className="h-10 w-10" aria-hidden />
      </motion.span>
      <div className="rounded-2xl bg-primary-soft p-4 text-left text-base font-semibold">
        <p className="font-extrabold">What happens next</p>
        <p className="mt-1">
          Field Support sees your device, step, and issue. They'll reach out to you, you don't need
          to do anything else right now.
        </p>
      </div>
      <Button size="xl" className="w-full" onClick={onClose}>
        Return to my guide
      </Button>
      <p className="text-xs font-semibold text-muted-foreground">{supportCopy.demoNote}</p>
    </div>
  );
}
