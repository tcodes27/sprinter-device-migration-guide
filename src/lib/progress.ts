import { useSyncExternalStore } from "react";
import type { DeviceId, MigrationPath } from "./workflow-types";
import { deviceOrder, stepsFor, workflows } from "@/content/workflows";

export type DeviceProgress = {
  /** What IT asked for. null = not chosen yet (the app never assumes). */
  path: MigrationPath | null;
  current: number; // 0-based step index within stepsFor(workflow, path)
  completed: number[];
  gates: string[]; // step ids where the reset gate was confirmed
  simDone: number[]; // step indexes whose tap-along sequence was finished
  verified: number[]; // step indexes where the Sprinter confirmed a version match
  finished: boolean;
  started: boolean;
};

export type ProgressState = Record<DeviceId, DeviceProgress>;

const KEY = "sh-migration-progress-v3";

const emptyDevice = (): DeviceProgress => ({ path: null, current: 0, completed: [], gates: [], simDone: [], verified: [], finished: false, started: false });
const emptyState = (): ProgressState => ({ iphone: emptyDevice(), "ipad-mini": emptyDevice(), "patient-ipad": emptyDevice() });

const SERVER_SNAPSHOT = emptyState();
let state: ProgressState | null = null;
const listeners = new Set<() => void>();

function normalize(raw: Partial<ProgressState>): ProgressState {
  const base = emptyState();
  for (const d of deviceOrder) {
    base[d] = { ...base[d], ...(raw[d] ?? {}) };
    if (!Array.isArray(base[d].simDone)) base[d].simDone = [];
    if (!Array.isArray(base[d].verified)) base[d].verified = [];
  }
  return base;
}

function load(): ProgressState {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    state = raw ? normalize(JSON.parse(raw) as Partial<ProgressState>) : emptyState();
  } catch {
    state = emptyState();
  }
  return state;
}

function save(next: ProgressState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress() {
  return useSyncExternalStore(subscribe, load, () => SERVER_SNAPSHOT);
}

function update(device: DeviceId, patch: (d: DeviceProgress) => DeviceProgress) {
  const s = load();
  save({ ...s, [device]: patch(s[device]) });
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
    update(device, (d) => ({ ...d, started: true, current: Math.max(0, index) }));
  },
  completeAndNext(device: DeviceId, index: number) {
    update(device, (d) => {
      const total = totalSteps(device, d);
      const completed = d.completed.includes(index) ? d.completed : [...d.completed, index];
      const isLast = index >= total - 1;
      return { ...d, started: true, completed, current: isLast ? index : index + 1, finished: isLast || d.finished };
    });
  },
  markSimDone(device: DeviceId, index: number) {
    update(device, (d) => (d.simDone.includes(index) ? d : { ...d, simDone: [...d.simDone, index] }));
  },
  markVerified(device: DeviceId, index: number) {
    update(device, (d) => (d.verified.includes(index) ? d : { ...d, verified: [...d.verified, index] }));
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
    const total = stepsFor(workflows.iphone, "update-reset").length;
    const all = Array.from({ length: total }, (_, i) => i);
    s.iphone = { path: "update-reset", current: total - 1, completed: all, simDone: all, verified: [1], gates: ["reset"], finished: true, started: true };
    s["ipad-mini"] = { ...emptyDevice(), path: "update", started: true };
    s["patient-ipad"] = { ...emptyDevice(), path: "update-reset", current: 1, completed: [0], simDone: [0], started: true };
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
