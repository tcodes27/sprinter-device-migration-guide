import { useSyncExternalStore } from "react";
import type { DeviceId, MigrationPath } from "./workflow-types";
import { deviceOrder, stepsFor, workflows } from "@/content/workflows";
import { checkpointsFor } from "./checkpoints";
import { deviceConfirmationCode } from "./confirmation";

export type VerifyAnswer = "matches" | "noMatch" | "dontKnow";

export type YesNo = "yes" | "no";

export type DeviceProgress = {
  /** What IT asked for. null = not chosen yet (the app never assumes). */
  path: MigrationPath | null;
  current: number; // 0-based step index within stepsFor(workflow, path)
  completed: number[];
  gates: string[]; // step ids where the reset gate was confirmed
  verified: number[]; // step indexes where the Sprinter confirmed a version match
  /** step id -> task ids that are done (detected on the practice device, ticked by hand, or confirmed) */
  checkpoints: Record<string, number[]>;
  /** step id -> the answer chosen on a decision step */
  answers: Record<string, VerifyAnswer>;
  /** Final-step health questions. Both must be answered before a device can be finished. */
  health: { connectivity: YesNo | null; other: YesNo | null };
  finished: boolean;
  started: boolean;
  /** Issued once when the device is finished. Sent to Field Support in the ticket reply. */
  confirmationCode: string | null;
  completedAt: string | null;
};

export type ProgressState = Record<DeviceId, DeviceProgress>;

/** Non-persisted store status shown to the user when local saving is not working. */
export type StorageStatus = {
  /** false when the last write to local storage failed */
  saveOk: boolean;
  /** devices whose saved record was unreadable and had to be reset on load */
  recovered: DeviceId[];
};

const KEY = "sh-migration-progress-v3";
const BACKUP_KEY = "sh-migration-progress-v3-backup";

const emptyDevice = (): DeviceProgress => ({ path: null, current: 0, completed: [], gates: [], verified: [], checkpoints: {}, answers: {}, health: { connectivity: null, other: null }, finished: false, started: false, confirmationCode: null, completedAt: null });
const emptyState = (): ProgressState => ({ iphone: emptyDevice(), "ipad-mini": emptyDevice(), "patient-ipad": emptyDevice() });

const SERVER_SNAPSHOT = emptyState();
const SERVER_STATUS: StorageStatus = { saveOk: true, recovered: [] };
let state: ProgressState | null = null;
let status: StorageStatus = { saveOk: true, recovered: [] };
const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();

type LegacyDevice = Partial<DeviceProgress> & { simDone?: number[]; checks?: Record<string, number[]> };

const validPaths: MigrationPath[] = ["update", "update-reset"];
const yesNo = (v: unknown): YesNo | null => (v === "yes" || v === "no" ? v : null);

/** Normalizes one device record. Throws when the record is not usable at all. */
function normalizeDevice(d: DeviceId, legacy: LegacyDevice): DeviceProgress {
  if (typeof legacy !== "object" || legacy === null || Array.isArray(legacy)) throw new Error("bad device record");
  const { simDone, checks, ...rest } = legacy;
  const p: DeviceProgress = { ...emptyDevice(), ...rest };
  if (p.path !== null && !validPaths.includes(p.path)) throw new Error("bad path");
  if (typeof p.current !== "number" || !Number.isFinite(p.current)) throw new Error("bad step index");
  if (!Array.isArray(p.verified)) p.verified = [];
  if (!Array.isArray(p.completed)) p.completed = [];
  if (!Array.isArray(p.gates)) p.gates = [];
  if (!p.checkpoints || typeof p.checkpoints !== "object" || Array.isArray(p.checkpoints)) p.checkpoints = {};
  if (!p.answers || typeof p.answers !== "object" || Array.isArray(p.answers)) p.answers = {};
  const h = (legacy.health ?? {}) as Partial<DeviceProgress["health"]>;
  p.health = { connectivity: yesNo(h.connectivity), other: yesNo(h.other) };
  p.finished = !!p.finished;
  p.started = !!p.started;
  if (typeof p.confirmationCode !== "string") p.confirmationCode = null;
  if (typeof p.completedAt !== "string") p.completedAt = null;
  // Migrate older saves: hand-ticked boxes and finished practice devices become checkpoints.
  if (checks && typeof checks === "object") {
    for (const [id, list] of Object.entries(checks)) if (Array.isArray(list)) p.checkpoints[id] = union(p.checkpoints[id] ?? [], list);
  }
  const steps = stepsFor(workflows[d], p.path ?? "update-reset");
  p.current = Math.min(Math.max(0, Math.floor(p.current)), steps.length - 1);
  const fullyDone = new Set<number>([...(Array.isArray(simDone) ? simDone : []), ...p.completed]);
  for (const i of fullyDone) {
    const step = steps[i];
    if (!step) continue;
    const all = checkpointsFor(step).map((c) => c.id);
    p.checkpoints[step.id] = union(p.checkpoints[step.id] ?? [], all);
  }
  for (const i of p.verified) {
    const step = steps[i];
    if (step) {
      p.checkpoints[step.id] = union(p.checkpoints[step.id] ?? [], [0]);
      p.answers[step.id] = p.answers[step.id] ?? "matches";
    }
  }
  // Finished devices from older saves answered the questions before the questions were persisted.
  if (p.finished) p.health = { connectivity: p.health.connectivity ?? "no", other: p.health.other ?? "no" };
  return p;
}

/**
 * Rebuilds the state one device at a time so a corrupted record only resets that device.
 * Returns the devices that could not be restored.
 */
function normalize(raw: unknown): { state: ProgressState; recovered: DeviceId[] } {
  const base = emptyState();
  const recovered: DeviceId[] = [];
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Partial<Record<DeviceId, LegacyDevice>>) : null;
  for (const d of deviceOrder) {
    if (!src) {
      recovered.push(d);
      continue;
    }
    if (src[d] === undefined) continue;
    try {
      base[d] = normalizeDevice(d, src[d] as LegacyDevice);
    } catch {
      recovered.push(d);
    }
  }
  return { state: base, recovered };
}

function union(a: number[], b: number[]) {
  return Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
}

function setStatus(patch: Partial<StorageStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}

function load(): ProgressState {
  if (state) return state;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (!raw) {
    state = emptyState();
    return state;
  }
  let parsed: unknown = null;
  let unreadable = false;
  try {
    parsed = JSON.parse(raw);
  } catch {
    unreadable = true;
  }
  const result = unreadable ? { state: emptyState(), recovered: [...deviceOrder] } : normalize(parsed);
  state = result.state;
  if (result.recovered.length) {
    // Keep a recoverable copy of what was there, then persist the cleaned state.
    try {
      window.localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* a backup is best effort */
    }
    queueMicrotask(() => setStatus({ recovered: result.recovered }));
  }
  return state;
}

function save(next: ProgressState) {
  state = next;
  let ok = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    // Confirm the write actually landed (some private modes accept and drop writes).
    ok = window.localStorage.getItem(KEY) !== null;
  } catch {
    ok = false;
  }
  if (ok !== status.saveOk) setStatus({ saveOk: ok });
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function subscribeStatus(l: () => void) {
  statusListeners.add(l);
  return () => statusListeners.delete(l);
}

export function useProgress() {
  return useSyncExternalStore(subscribe, load, () => SERVER_SNAPSHOT);
}

/** Whether local saving is working and whether any saved device had to be reset on load. */
export function useStorageStatus() {
  return useSyncExternalStore(subscribeStatus, () => status, () => SERVER_STATUS);
}

export const storageActions = {
  /** The Sprinter has read the "could not restore" notice. */
  dismissRecovered() {
    setStatus({ recovered: [] });
  },
};

/** True when the device has anything worth protecting (used before a path change or demo load). */
export function hasProgress(p: DeviceProgress) {
  return !!p.path && (p.started || p.finished || p.completed.length > 0 || Object.values(p.checkpoints).some((l) => l.length > 0));
}

function update(device: DeviceId, patch: (d: DeviceProgress) => DeviceProgress) {
  const s = load();
  const next = patch(s[device]);
  if (next === s[device]) return;
  save({ ...s, [device]: next });
}

export function healthAnswered(p: DeviceProgress) {
  return p.health.connectivity !== null && p.health.other !== null;
}

export function totalSteps(device: DeviceId, p: DeviceProgress) {
  return stepsFor(workflows[device], p.path ?? "update-reset").length;
}

export const progressActions = {
  /** Choosing a path starts (or restarts) that device's journey. */
  setPath(device: DeviceId, path: MigrationPath) {
    update(device, (d) => (d.path === path ? { ...d, started: true } : { ...emptyDevice(), path, started: true }));
  },
  start(device: DeviceId) {
    update(device, (d) => ({ ...d, started: true }));
  },
  goTo(device: DeviceId, index: number) {
    update(device, (d) => {
      const next = Math.min(Math.max(0, index), totalSteps(device, d) - 1);
      return next === d.current && d.started ? d : { ...d, started: true, current: next };
    });
  },
  /** Answers one of the final-step health questions. Both are required before the device can finish. */
  setHealthAnswer(device: DeviceId, question: keyof DeviceProgress["health"], answer: YesNo) {
    update(device, (d) => ({ ...d, health: { ...d.health, [question]: answer } }));
  },
  completeAndNext(device: DeviceId, index: number) {
    update(device, (d) => {
      const total = totalSteps(device, d);
      const isLast = index >= total - 1;
      // The last step cannot complete until both health questions are answered (enforced here, not only in the UI).
      if (isLast && !d.finished && !healthAnswered(d)) return d;
      const completed = d.completed.includes(index) ? d.completed : [...d.completed, index];
      const nowFinished = isLast || d.finished;
      return {
        ...d,
        started: true,
        completed,
        current: isLast ? index : index + 1,
        finished: nowFinished,
        confirmationCode: nowFinished ? (d.confirmationCode ?? deviceConfirmationCode(device)) : d.confirmationCode,
        completedAt: nowFinished ? (d.completedAt ?? new Date().toISOString()) : d.completedAt,
      };
    });
  },
  /** Issues a confirmation code for a finished device that predates codes (older saves, demo data). */
  ensureConfirmation(device: DeviceId) {
    update(device, (d) =>
      d.finished && !d.confirmationCode
        ? { ...d, confirmationCode: deviceConfirmationCode(device), completedAt: d.completedAt ?? new Date().toISOString() }
        : d,
    );
  },
  /** A version match: remembers the answer, ticks the decision checkpoint and unlocks the step. */
  markVerified(device: DeviceId, index: number, stepId: string) {
    update(device, (d) => ({
      ...d,
      verified: d.verified.includes(index) ? d.verified : [...d.verified, index],
      checkpoints: { ...d.checkpoints, [stepId]: union(d.checkpoints[stepId] ?? [], [0]) },
      answers: { ...d.answers, [stepId]: "matches" },
    }));
  },
  /** A "no match" or "don't know" answer is remembered and clears any earlier match, so the step cannot falsely advance. */
  setAnswer(device: DeviceId, index: number, stepId: string, answer: Exclude<VerifyAnswer, "matches">) {
    update(device, (d) => ({
      ...d,
      answers: { ...d.answers, [stepId]: answer },
      verified: d.verified.filter((i) => i !== index),
      checkpoints: { ...d.checkpoints, [stepId]: (d.checkpoints[stepId] ?? []).filter((i) => i !== 0) },
    }));
  },
  completeCheckpoint(device: DeviceId, stepId: string, item: number) {
    update(device, (d) => {
      const list = d.checkpoints[stepId] ?? [];
      return list.includes(item) ? d : { ...d, checkpoints: { ...d.checkpoints, [stepId]: union(list, [item]) } };
    });
  },
  uncheckCheckpoint(device: DeviceId, stepId: string, item: number) {
    update(device, (d) => {
      const list = d.checkpoints[stepId] ?? [];
      return list.includes(item) ? { ...d, checkpoints: { ...d.checkpoints, [stepId]: list.filter((i) => i !== item) } } : d;
    });
  },
  toggleCheckpoint(device: DeviceId, stepId: string, item: number) {
    update(device, (d) => {
      const list = d.checkpoints[stepId] ?? [];
      const next = list.includes(item) ? list.filter((i) => i !== item) : union(list, [item]);
      return { ...d, checkpoints: { ...d.checkpoints, [stepId]: next } };
    });
  },
  /** The Sprinter confirms every remaining task of a step (things the app cannot detect). */
  confirmRemaining(device: DeviceId, stepId: string, count: number) {
    update(device, (d) => ({ ...d, checkpoints: { ...d.checkpoints, [stepId]: Array.from({ length: count }, (_, i) => i) } }));
  },
  confirmGate(device: DeviceId, stepId: string) {
    update(device, (d) => ({ ...d, gates: d.gates.includes(stepId) ? d.gates : [...d.gates, stepId] }));
  },
  reset(device: DeviceId) {
    update(device, () => emptyDevice());
  },
  resetAll() {
    save(emptyState());
  },
  loadDemo() {
    const s = emptyState();
    const iphoneSteps = stepsFor(workflows.iphone, "update-reset");
    const total = iphoneSteps.length;
    const all = Array.from({ length: total }, (_, i) => i);
    const allDone = (steps: typeof iphoneSteps, upTo: number) => Object.fromEntries(steps.slice(0, upTo).map((st) => [st.id, checkpointsFor(st).map((c) => c.id)]));
    s.iphone = { path: "update-reset", current: total - 1, completed: all, verified: [1], checkpoints: allDone(iphoneSteps, total), answers: { [iphoneSteps[1]!.id]: "matches" }, health: { connectivity: "no", other: "no" }, gates: ["reset"], finished: true, started: true, confirmationCode: deviceConfirmationCode("iphone"), completedAt: new Date().toISOString() };
    s["ipad-mini"] = { ...emptyDevice(), path: "update", started: true };
    const patientSteps = stepsFor(workflows["patient-ipad"], "update-reset");
    s["patient-ipad"] = { ...emptyDevice(), path: "update-reset", current: 1, completed: [0], checkpoints: allDone(patientSteps, 1), started: true };
    save(s);
  },
};

export type DeviceStatus = "complete" | "in-progress" | "not-started";

export function deviceStatus(p: DeviceProgress): DeviceStatus {
  if (p.finished) return "complete";
  if (p.path && (p.started || p.completed.length > 0)) return "in-progress";
  return "not-started";
}

export function percent(device: DeviceId, p: DeviceProgress) {
  if (p.finished) return 100;
  if (!p.path) return 0;
  return Math.round((p.completed.length / totalSteps(device, p)) * 100);
}

export function summary(s: ProgressState) {
  const done = deviceOrder.filter((d) => s[d].finished).length;
  return { done, total: deviceOrder.length, allDone: done === deviceOrder.length };
}
