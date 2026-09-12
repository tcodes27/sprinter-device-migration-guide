import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workflows } from "@/content/workflows";
import { progressActions, useProgress } from "@/lib/progress";
import type { DeviceId } from "@/lib/workflow-types";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <>
      <Button variant="outline" size="lg" onClick={copy} disabled={!text}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />} {copied ? "Copied" : label}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}

/**
 * Green "Device complete" card with this device's confirmation code.
 * Shown on the final step once the device is finished, and survives refresh.
 */
export function DeviceConfirmationCard({ device }: { device: DeviceId }) {
  const p = useProgress()[device];

  useEffect(() => {
    if (p.finished && !p.confirmationCode) progressActions.ensureConfirmation(device);
  }, [device, p.finished, p.confirmationCode]);

  if (!p.finished) return null;

  return (
    <div className="rounded-2xl border border-success/30 bg-success-soft p-5" aria-label="Device confirmation code">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-success">Device complete</p>
      <p className="mt-1 text-xl font-black text-foreground">{workflows[device].name} confirmation code</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <code className="rounded-xl bg-card px-4 py-2 text-2xl font-black tracking-widest text-foreground shadow-soft">
          {p.confirmationCode ?? "…"}
        </code>
        <CopyButton text={p.confirmationCode ?? ""} label="Copy code" />
      </div>
      <p className="mt-3 text-base font-semibold text-muted-foreground">
        Copy this confirmation code and send it in your reply to Field Support. This lets them know your device is
        finished.
      </p>
    </div>
  );
}
