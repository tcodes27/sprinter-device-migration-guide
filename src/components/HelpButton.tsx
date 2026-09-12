import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TroubleshootDialog } from "./TroubleshootDialog";
import type { TroubleChoice } from "@/lib/workflow-types";

type Props = {
  /** Where the user is right now, e.g. "Step 4 — Erase & Reset iPhone" */
  location?: string;
  answers?: Partial<Record<TroubleChoice, string>>;
};

type Option = { label: string; answer?: string; action?: "different" | "contact" | "connectivity" };

const options: Option[] = [
  { label: "I don't understand this step", answer: "That's okay. Read the \"What to do\" list one line at a time and do only that line. Use \"Why?\" if you want to know the reason. If it still isn't clear, contact Field Support." },
  { label: "My screen looks different", action: "different" },
  { label: "My device is stuck", answer: "Wait two full minutes — some steps take longer than they look. Keep the device plugged in. If nothing changes, contact Field Support." },
  { label: "I have a connectivity problem", action: "connectivity" },
  { label: "Something else", action: "contact" },
];

export function HelpButton({ location, answers }: Props) {
  const [open, setOpen] = useState(false);
  const [different, setDifferent] = useState(false);
  const [picked, setPicked] = useState<Option | null>(null);

  const close = () => {
    setOpen(false);
    setPicked(null);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-primary px-5 text-base font-extrabold text-primary-foreground shadow-float focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
        aria-label="Need help?"
      >
        <LifeBuoy aria-hidden />
        Need help?
      </motion.button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl">Need help?</DialogTitle>
            <DialogDescription className="text-base">
              {location ? (
                <>
                  You are currently on: <span className="font-extrabold text-foreground">{location}</span>. Tell us what is happening.
                </>
              ) : (
                "Tell us what is happening."
              )}
            </DialogDescription>
          </DialogHeader>

          {!picked ? (
            <div className="grid gap-2 pt-2">
              {options.map((o) => (
                <Button
                  key={o.label}
                  variant="outline"
                  size="xl"
                  className="justify-start whitespace-normal text-left"
                  onClick={() => {
                    if (o.action === "different") {
                      close();
                      setDifferent(true);
                    } else setPicked(o);
                  }}
                >
                  {o.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {picked.answer ? (
                <p className="rounded-2xl bg-primary-soft p-4 text-base font-semibold">{picked.answer}</p>
              ) : picked.action === "connectivity" ? (
                <p className="rounded-2xl bg-warning-soft p-4 text-base font-semibold">Please tell Field Support before finishing your migration.</p>
              ) : (
                <p className="rounded-2xl bg-danger-soft p-4 text-base font-semibold">Do not guess. Contact Field Support.</p>
              )}
              <div className="grid gap-2">
                <Button asChild size="xl">
                  <Link to="/help" search={picked.action === "connectivity" ? { issue: "connectivity" } : {}} onClick={close}>
                    {picked.action === "connectivity" ? "Report a connectivity issue" : "Contact Field Support"}
                  </Link>
                </Button>
                <Button variant="soft" size="lg" onClick={close}>
                  Back to what I was doing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TroubleshootDialog open={different} onOpenChange={setDifferent} answers={answers} />
    </>
  );
}
