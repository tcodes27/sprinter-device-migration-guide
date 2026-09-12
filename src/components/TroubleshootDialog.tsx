import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, OctagonAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { defaultTroubleAnswers, troubleChoices } from "@/content/shared";
import type { TroubleChoice } from "@/lib/workflow-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  question?: string;
  answers?: Partial<Record<TroubleChoice, string>> | undefined;
};

export function TroubleshootDialog({ open, onOpenChange, title = "That's okay — let's figure it out.", question = "What looks different?", answers }: Props) {
  const [choice, setChoice] = useState<TroubleChoice | null>(null);
  const merged = { ...defaultTroubleAnswers, ...answers };
  const stopHere = choice === "error" || choice === "other";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setChoice(null);
      }}
    >
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{choice ? "Here's what to do:" : question}</DialogDescription>
        </DialogHeader>

        {!choice ? (
          <div className="grid gap-2 pt-2">
            {troubleChoices.map((c) => (
              <Button key={c.id} variant="outline" size="xl" className="justify-start" onClick={() => setChoice(c.id)}>
                {c.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="rounded-2xl bg-primary-soft p-4 text-base font-semibold text-foreground">{merged[choice]}</p>
            {stopHere && (
              <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4">
                <OctagonAlert className="mt-0.5 h-6 w-6 shrink-0 text-danger" aria-hidden />
                <p className="text-base font-bold text-foreground">Stop here and contact Field Support.</p>
              </div>
            )}
            <div className="grid gap-2">
              <Button asChild size="xl" variant={stopHere ? "default" : "outline"}>
                <Link to="/help">Contact Field Support</Link>
              </Button>
              <Button variant="ghost" size="lg" onClick={() => setChoice(null)}>
                <ArrowLeft aria-hidden /> Pick a different answer
              </Button>
              <Button variant="soft" size="lg" onClick={() => onOpenChange(false)}>
                Back to my step
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
