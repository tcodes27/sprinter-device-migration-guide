import { TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { support } from "@/content/config";
import { workflows } from "@/content/workflows";
import { storageActions, useStorageStatus } from "@/lib/progress";

/**
 * Non-technical warnings about local saving:
 * - progress could not be written (shown while it keeps failing, clears when a save succeeds)
 * - a saved record could not be read and had to be reset (shown once, dismissible)
 */
export function StorageNotice({ className }: { className?: string }) {
  const { saveOk, recovered } = useStorageStatus();
  if (saveOk && recovered.length === 0) return null;
  return (
    <div className={className}>
      {!saveOk && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-warning/50 bg-warning-soft p-4 text-warning-foreground">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="text-base font-extrabold">Progress is not being saved</p>
            <p className="text-sm font-semibold">{support.saveFailed}</p>
          </div>
        </div>
      )}
      {recovered.length > 0 && (
        <div role="status" className="mt-2 flex items-start gap-3 rounded-2xl border border-warning/50 bg-warning-soft p-4 text-warning-foreground">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold">Saved progress could not be fully restored</p>
            <p className="text-sm font-semibold">
              {support.restoreFailed} Affected: {recovered.map((d) => workflows[d].name).join(", ")}.
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Dismiss this notice" className="min-h-11 min-w-11 shrink-0" onClick={() => storageActions.dismissRecovered()}>
            <X aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
