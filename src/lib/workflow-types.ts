/**
 * Reusable workflow objects.
 * All Sprinter-facing content lives in src/content/*.ts so authorized
 * administrators can update instructions, screens, warnings, and help
 * text without touching UI code.
 */

export type DeviceId = "iphone" | "ipad-mini" | "patient-ipad";

export type ScreenRow = { label: string; sub?: string; highlight?: boolean; value?: string };

/** Illustrated example of what the user should see on their device. */
export type Screen =
  | { kind: "list"; title: string; rows: ScreenRow[] }
  | { kind: "message"; title: string; body?: string; button?: string; highlight?: boolean }
  | { kind: "wait"; title: string; body?: string }
  | { kind: "home"; title: string; apps: string[] };

export type StepKind = "instruction" | "waiting" | "complete";

export type WorkflowStep = {
  id: string;
  kind?: StepKind;
  /** Short heading, e.g. "Update your iPhone" */
  title: string;
  /** One calm sentence of context */
  intro: string;
  /** What to do — short numbered actions */
  todo?: string[];
  /** Illustrated example screen */
  screen?: Screen;
  /** "Look for:" label shown with the screen */
  lookFor?: string;
  /** Why? pop-out */
  why?: { title: string; body: string };
  /** What happens next? pop-out */
  whatNext?: string;
  /** Label for the primary button that moves forward */
  nextLabel: string;
  /** Show the "Before you reset" confirmation gate before this step */
  resetGate?: boolean;
  /** Extra guided panels available on this step */
  extras?: ("testflight" | "permissions" | "authError")[];
  /** Optional step-specific troubleshooting answers */
  troubleshoot?: Partial<Record<TroubleChoice, string>>;
};

export type TroubleChoice = "noButton" | "error" | "stuck" | "dontKnow" | "other";

export type DeviceWorkflow = {
  id: DeviceId;
  name: string;
  shortName: string;
  description: string;
  startLabel: string;
  frame: "phone" | "tablet" | "tablet-wide";
  steps: WorkflowStep[];
  completionChecklist: string[];
};
