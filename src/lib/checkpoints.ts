import type { WorkflowStep } from "./workflow-types";

/**
 * Reusable checkpoint model. Every step is broken into small tasks with a
 * saved done/not-done state so the Sprinter always knows what is finished,
 * what is current, and what comes next, even after a refresh or a pause.
 */
export type CheckpointKind =
  | "sim" // can be detected on the practice device
  | "physical" // happens on the real device, the Sprinter confirms it
  | "decision"; // a question the Sprinter answers (e.g. version check)

export type Checkpoint = { id: number; label: string; kind: CheckpointKind };

export const VERIFY_CHECKPOINT_LABEL = "Confirm the software version";

/** Tasks for a step, in order. Index = checkpoint id. */
export function checkpointsFor(step: WorkflowStep): Checkpoint[] {
  if (step.kind === "complete") return [];
  if (step.kind === "verify-version") return [{ id: 0, label: VERIFY_CHECKPOINT_LABEL, kind: "decision" }];
  if (step.sequence) {
    return step.sequence.filter((s) => s.kind !== "final").map((s, i) => ({ id: i, label: s.hint, kind: "sim" }));
  }
  return (step.todo ?? []).map((t, i) => ({ id: i, label: t, kind: "physical" }));
}

export function countDone(list: Checkpoint[], done: number[]) {
  return list.filter((c) => done.includes(c.id)).length;
}

/** The current task is always the first one that is not done. Returns list.length when everything is done. */
export function firstIncomplete(list: Checkpoint[], done: number[]) {
  const i = list.findIndex((c) => !done.includes(c.id));
  return i === -1 ? list.length : i;
}

export function isStepComplete(list: Checkpoint[], done: number[]) {
  return list.every((c) => done.includes(c.id));
}
