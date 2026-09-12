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

export type StepKind = "instruction" | "waiting" | "verify-version" | "complete";

/** What the IT message asked the Sprinter to do. The app never decides this. */
export type MigrationPath = "update" | "update-reset";

export const pathLabels: Record<MigrationPath, string> = { update: "Update only", "update-reset": "Update + Reset" };

/* ---------------- Tap-along simulator model ---------------- */

/** A tappable (or decorative) element on a simulated device screen. */
export type SimItem = {
  label: string;
  sub?: string;
  /** The element the Sprinter must tap to move on */
  target?: boolean;
  /** Red/destructive styling (e.g. "Erase iPhone") */
  destructive?: boolean;
  /** Show a checkmark next to it (e.g. connected Wi-Fi) */
  checked?: boolean;
  /** Right-side value text */
  value?: string;
};

/** One screen in a tap sequence. Screens with a target wait for a tap; progress screens auto-advance; final screens end the sequence. */
export type SimScreen =
  | { kind: "home"; hint: string; apps: SimItem[] }
  | { kind: "list"; hint: string; title: string; items: SimItem[]; back?: string; footer?: SimItem }
  | { kind: "prompt"; hint: string; title: string; body?: string; field?: string; buttons: SimItem[] }
  | { kind: "hello"; hint: string; label?: string }
  | { kind: "progress"; hint: string; title: string; body?: string; durationMs: number }
  | { kind: "final"; hint: string; title: string; body?: string; apps?: string[] };

export type WorkflowStep = {
  id: string;
  kind?: StepKind;
  /** Short heading, e.g. "Update your iPhone" */
  title: string;
  /** One calm sentence of context */
  intro: string;
  /** What to do, short numbered actions (fallback when no sequence) */
  todo?: string[];
  /** Tap-along sequence played on the practice device */
  sequence?: SimScreen[];
  /** Illustrated example screen (fallback) */
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
  extras?: ("testflightAfterErase" | "permissions" | "authError")[];
  /** Optional step-specific troubleshooting answers */
  troubleshoot?: Partial<Record<TroubleChoice, string>>;
  /** Which IT-requested paths include this step. Omitted = every path. */
  paths?: MigrationPath[];
  /** Short label used in the route overview (e.g. "Reset") */
  phase?: string;
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
  completionChecklist: Record<MigrationPath, string[]>;
  /** Small always-visible information card (e.g. Patient-Facing device note) */
  note?: { title: string; lines: string[] };
};
