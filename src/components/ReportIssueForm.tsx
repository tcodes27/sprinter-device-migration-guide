import { useState } from "react";
import { CheckCircle2, Paperclip } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { deviceOrder, workflows } from "@/content/workflows";

type Props = { issueType?: string; defaultDevice?: string };

/**
 * Prototype only: collects the report and shows a confirmation.
 * Not yet connected to ticketing, email, or Slack.
 */
export function ReportIssueForm({ issueType, defaultDevice }: Props) {
  const [sent, setSent] = useState(false);
  const [device, setDevice] = useState(defaultDevice ?? "");
  const [frequency, setFrequency] = useState("");
  const isConnectivity = issueType === "connectivity";

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card-soft space-y-3 p-6 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h2 className="text-2xl">Thank you</h2>
        <p className="text-base text-muted-foreground">Your report is ready for Field Support. Keep the device nearby in case they need more details.</p>
        <p className="rounded-xl bg-muted p-3 text-sm font-semibold text-muted-foreground">Prototype: this report is not sent anywhere yet. Please also reach Field Support using the contact IT gave you.</p>
      </motion.div>
    );
  }

  return (
    <form
      className="card-soft space-y-6 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div>
        <h2 className="text-2xl">{isConnectivity ? "Report a connectivity issue" : "Tell IT about a problem"}</h2>
        <p className="mt-1 text-base text-muted-foreground">Short answers are fine. You don't need technical words.</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Device — which device are you using?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {deviceOrder.map((d) => (
            <Button key={d} type="button" variant={device === d ? "default" : "outline"} size="lg" onClick={() => setDevice(d)} aria-pressed={device === d}>
              {workflows[d].name}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="problem" className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Problem — what is happening?
        </Label>
        <Textarea id="problem" required rows={4} className="rounded-xl text-base" placeholder="Example: The app won't open after I tap it." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="when" className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            When did it start?
          </Label>
          <Input id="when" className="min-h-12 rounded-xl text-base" placeholder="Example: This morning" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="where" className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Where are you when it happens?
          </Label>
          <Input id="where" className="min-h-12 rounded-xl text-base" placeholder="Example: At a patient's home" />
        </div>
      </div>

      {isConnectivity && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Does it happen all the time or only sometimes?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {["All the time", "Only sometimes"].map((f) => (
              <Button key={f} type="button" variant={frequency === f ? "default" : "outline"} size="lg" onClick={() => setFrequency(f)} aria-pressed={frequency === f}>
                {f}
              </Button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-2">
        <Label htmlFor="photo" className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Photo — attach a screenshot if useful (optional)
        </Label>
        <label htmlFor="photo" className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary-soft/50 px-4 text-base font-bold text-primary">
          <Paperclip aria-hidden /> Choose a photo
          <input id="photo" type="file" accept="image/*" className="sr-only" />
        </label>
      </div>

      <Button type="submit" size="xl">
        Send / Report issue
      </Button>
    </form>
  );
}
