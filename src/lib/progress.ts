import { useSyncExternalStore } from "react";
import type { DeviceId } from "./workflow-types";
import { deviceOrder, workflows } from "@/content/workflows";

export type DeviceProgress = {
  current: number; // 0-based step index
  completed: number[];
  gates: string[]; // step ids where the reset gate was confirmed
  finished: boolean;
  started: boolean;
};

export type ProgressState = Record<DeviceId, DeviceProgress>;

const KEY = "sh-migration-progress-v1";

const emptyDevice = (): DeviceProgress => ({ current: 0, completed: [], gates: [], finished: false, started: false });
const emptyState = (): ProgressState => ({ iphone: emptyDevice(), "ipad-mini": emptyDevice(), "patient-ipad": emptyDevice() });

const SERVER_SNAPSHOT = emptyState();
let state: ProgressState | null = null;
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    state = raw ? { ...emptyState(), ...(JSON.parse(raw) as ProgressState) } : emptyState();
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

export const progressActions = {
  start(device: DeviceId) {
    update(device, (d) => ({ ...d, started: true }));
  },
  goTo(device: DeviceId, index: number) {
    update(device, (d) => ({ ...d, started: true, current: Math.max(0, index) }));
  },
  completeAndNext(device: DeviceId, index: number) {
    const total = workflows[device].steps.length;
    update(device, (d) => {
      const completed = d.completed.includes(index) ? d.completed : [...d.completed, index];
      const isLast = index >= total - 1;
      return { ...d, started: true, completed, current: isLast ? index : index + 1, finished: isLast || d.finished };
    });
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
    const total = workflows.iphone.steps.length;
    s.iphone = { current: total - 1, completed: Array.from({ length: total }, (_, i) => i), gates: ["reset"], finished: true, started: true };
    s["ipad-mini"] = { current: 0, completed: [], gates: [], finished: false, started: true };
    s["patient-ipad"] = { current: 1, completed: [0], gates: [], finished: false, started: true };
    save(s);
  },
};

export type DeviceStatus = "complete" | "in-progress" | "not-started";

export function deviceStatus(p: DeviceProgress): DeviceStatus {
  if (p.finished) return "complete";
  if (p.started || p.completed.length > 0) return "in-progress";
  return "not-started";
}

export function summary(s: ProgressState) {
  const done = deviceOrder.filter((d) => s[d].finished).length;
  return { done, total: deviceOrder.length, allDone: done === deviceOrder.length };
}
