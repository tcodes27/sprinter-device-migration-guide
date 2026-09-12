# Persistent task checkpoints inside every step

The screen stays exactly as it is (practice device, "What to do" list, top route bar, sticky bottom button, Pause, Why?, etc.). What changes is that every task row becomes a saved checkpoint, so after a refresh, a lost connection or a pause the Sprinter lands back on the exact task they stopped at.

## What is true today (verified in code)

- Progress is saved in the browser (localStorage, no backend exists). Saved per device: current step, finished steps, `simDone` (practice device fully finished), `verified` (version match), and `checks` (boxes ticked by hand).
- The practice device position (which screen / which task is current) is NOT saved. After a refresh mid-step the device restarts at screen 1 and the "Do this now" marker jumps back to task 1, even though hand-ticked boxes survive.
- "Current task" follows the practice device only; hand-ticked boxes do not move it.
- The bottom button can be pressed on a practice step before any task is done, which marks the whole step complete.
- The version step has no task row / count; only the three answer buttons.

## What the Sprinter will see

1. Same task rows, now with three obvious states, never hidden:
   - Done: green filled box with check mark, text slightly dimmed and struck through (existing style).
   - Current: existing purple pulsing number + "DO THIS NOW" badge.
   - Not yet: empty numbered box.
   Only one current task at a time: always the first task that is not done.
2. Tapping the glowing spot on the practice device ticks that task automatically and moves "Do this now" to the next one. Ticking a box by hand does the same (and the practice device moves to that screen), so the list and device always agree.
3. A small line under the "WHAT TO DO" heading: "3 of 5 tasks complete". At the end it reads "5 of 5 tasks complete" with the existing green "All done" line.
4. Coming back later (refresh, closed tab, Pause, My devices and back): done tasks are still ticked, the practice device opens on the current task's screen, nothing is re-played or reset.
5. Bottom button:
   - When every task is done: existing label ("Update is done, check it", etc.), filled purple with check mark, as today.
   - When tasks remain on a practice step: outline style with a clear label "I did all of this on my real device" plus the existing helper line. Pressing it records the remaining tasks as confirmed by the Sprinter (so a step can never be marked complete with unticked tasks), then moves on.
   - Steps with a plain to-do list (things done on the real device only) work the same way: tick by hand, or confirm everything with the bottom button.
6. Version step: gets one task row "Confirm the software version" with "0 of 1 tasks complete". "It matches" ticks it and enables "Version confirmed, continue". "It does not match" and "I don't know" never tick it and keep the existing help branches. The chosen answer is also remembered on return.
7. Top route bar and step dots are unchanged; they keep showing where you are in the whole migration.

## Technical details

- `src/lib/checkpoints.ts` (new, pure helpers, reusable by any workflow):
  - `checkpointsFor(step)` -> `{ id, label, kind: "sim" | "physical" | "decision" }[]` derived from `step.sequence` (non-final screens), `step.todo`, or the verify step.
  - `firstIncomplete(list, doneIds)`, `countDone(...)`, `isStepComplete(...)`.
- `src/lib/progress.ts`: replace `checks` with `checkpoints: Record<stepId, number[]>` (same shape, new meaning: any done task, whether auto, hand-ticked or confirmed). Keep storage key v3; `normalize` migrates old data: existing `checks` copied over, and `simDone` step indexes expand to all task indexes. Add actions `completeCheckpoint(device, stepId, i)`, `uncheckCheckpoint`, `confirmRemaining(device, stepId, count)`. `markVerified` also writes the decision checkpoint. `completeAndNext` requires all checkpoints done (StepView guarantees this by confirming remaining first). Demo data updated.
- `src/components/DeviceSimulator.tsx`: new `initialIndex` prop (replaces `initiallyDone`) and `onScreenPassed(i)` callback fired when a target screen is tapped (or a progress screen finishes). Reset key includes the restored index so hand-ticking can move the device.
- `src/components/InstructionPanel.tsx`: takes `doneIds` + `currentIndex` + `onToggle`; adds the "x of y tasks complete" line (`aria-live="polite"`); keeps `role="checkbox"` buttons, focus ring, reduced-motion behaviour.
- `src/components/StepView.tsx`: derive everything from the store instead of local `sim` state: `done = progress.checkpoints[step.id]`, `current = firstIncomplete`, `simDone = isStepComplete`. Wire simulator taps to `completeCheckpoint`, hand-tick toggles, bottom button label/variant/confirm-remaining logic, and the verify checkpoint row above `VersionCheck`.
- `src/components/VersionCheck.tsx`: accept a persisted `answer` prop and `onAnswer` so the choice survives a refresh (stored in `progress` as `verifyAnswer` per step id).
- No changes to workflow content files, routes, support flows, top bar, or reset gate.
- Verify with typecheck, build log, and Playwright: tap through two tasks on iPad Mini update, refresh, confirm ticks + "Do this now" + device screen restored; hand-tick/untick; bottom button confirm-remaining; version step answers; 1280px and 390px.
