# QA fixes: browser Back, required final questions, truthful copy, safe path change, demo safety, report form, storage failures, accessibility

Scope: fix only the eight audit findings plus the two accessibility gaps. No backend, AI, integrations, redesign, or new dependencies. Existing routes, content structure, visual design and workflow logic stay as they are.

## 1. Browser Back inside a workflow (QA-1)
Today step changes only update saved progress; the URL never changes, so Back leaves the site.
- Add an optional `step` search param to `/device/$deviceId` (validated as a positive integer, ignored when invalid).
- When the Sprinter advances or goes back with the app buttons, push a history entry with the new step number. Only push when the step actually changes, so rapid clicks and re-renders never create duplicates.
- When the URL step changes because of browser Back/Forward, move the workflow to that step, clamped to steps already reached (never past the first unfinished step). Saved progress stays the source of truth on refresh: on first load the URL is silently replaced with the saved step.
- The existing Back button, Pause link, refresh/resume, direct links and the home "Continue" button keep working unchanged.

## 2. Final questions truly required (QA-2)
The two completion questions live in local component state and Finish ignores them.
- Save the two answers (connectivity / other problems, yes or no) in the device's persisted progress so they survive refresh.
- Finish stays disabled until both are answered; the button and a short note under it say what is still needed ("Answer the two questions above to finish"). The guard is enforced in the advance logic, not only via the disabled attribute, so clicks, Enter/Space and scripted clicks cannot bypass it.
- Wording and visual style of the questions are unchanged. Once answered, completion, code issue and the "another device?" dialog work exactly as today.

## 3. False email promise (QA-3)
Replace the `followUpEmail` copy in `src/content/config.ts` with truthful guidance: copy the completion summary or code and send it in the reply to Field Support; nothing is sent automatically from this guide. The `/complete` page keeps showing that line in the same place.

## 4. Path change confirmation (QA-4)
Choosing a different path for a device with progress currently wipes it silently.
- In the device chooser, when the chosen path differs from a saved path and the device has any progress (started, completed steps, checkpoints or finished), show a confirmation dialog before applying: "Changing to <new path> restarts this device from the beginning. Progress and checkpoints for <old path> will be cleared."
- Two explicit choices: "Keep current path" (closes, nothing changes, navigates to the device as before) and "Start over with <new path>" (runs the existing path-change behavior).
- Other devices are never touched. Choosing the same path is unaffected.

## 5. Demo mode safety (QA-5)
- Home link becomes an explicit internal label ("Internal demo mode, for Sprinter Health staff demonstrations only") and the demo page header already says sample data; add one sentence that loading sample data replaces whatever is currently saved in this browser.
- "Load sample devices" and "Clear all progress" ask for confirmation first when any progress exists, stating that current progress will be replaced/erased. With nothing saved they run immediately as today.
- `/demo` route and its functionality remain.

## 6. Report issue form (QA-6)
- Device selection is required: label marked "(required)", the submit is blocked with an inline message ("Choose which device this is about") until one is chosen. Existing default-device prefill still works.
- Attachment: keep the picker, show the chosen file name, and add a visible note that in this prototype photos are not uploaded or sent anywhere. The "Thank you" screen keeps its existing prototype disclaimer.

## 7. Storage failure warning (QA-7)
- The progress store records whether the last save succeeded and exposes it with the progress state.
- When a save fails, a compact non-technical banner appears in the workflow and on the home page: "We could not save your progress on this device. Do not leave or refresh this page until you finish, or your progress may be lost." The banner clears automatically once a later save succeeds.
- While saving is failing, the "Pause · progress saved" label reads "Pause" only (and its accessible label drops "progress saved"). The app remains usable in memory.

## 8. Corrupted saved progress (QA-8)
- Parse and normalize each device's record independently. If the whole record is unreadable, or one device's record is malformed, only the affected devices are reset; valid devices are kept.
- Before resetting, the raw invalid data is copied to a separate backup key (`sh-migration-progress-v3-backup`) so it is recoverable, without showing it in the UI.
- A one-time notice is shown on the next screen: "Some saved progress could not be restored. You may need to restart the affected device." It names the affected devices and can be dismissed.

## 9. Accessibility (audit items)
- "Copied" confirmation: add a visually hidden polite live region to `CopyButton` so screen readers announce it.
- Press-and-hold alternative: `HoldToConfirm` gets a small text link beneath it, "Can't press and hold? Confirm another way", which reveals a checkbox ("I understand this will erase the device") plus a regular confirm button that is enabled only once the checkbox is ticked. Used automatically by both places the hold exists (chooser reset confirmation and the reset gate). Destructive protection is preserved: still a deliberate two-action confirmation, no timer required.

## Validation
Playwright runs (kept outside the project) plus lint/build: home → device → workflow → browser Back and Forward; app Back button; refresh mid-workflow; leave and resume; update-only and update+reset paths end to end; final questions block then allow Finish; completion page copy; path change cancel and confirm (other devices unchanged); demo load/clear with and without progress; report form without and with device; simulated storage write failure; corrupted and partially corrupted saved data; "Copied" live region present; reset confirmation with pointer, keyboard hold and the checkbox alternative; widths 360, 393, 834, 1280.

## Technical details
- Files: `src/routes/device.$deviceId.tsx` (search param, history sync), `src/components/StepView.tsx` (step navigation via URL, required final answers, storage banner, pause label), `src/lib/progress.ts` (per-device safe load, backup key, save status, final answers, recovery notice state), `src/components/DeviceChooser.tsx` (path-change confirmation), `src/routes/demo.tsx` and `src/routes/index.tsx` (demo labeling and confirmations), `src/components/ReportIssueForm.tsx`, `src/components/ConfirmationCode.tsx`, `src/components/HoldToConfirm.tsx`, `src/content/config.ts` and `src/content/shared.ts` (new copy strings only).
- No new packages. Confirmation dialogs reuse the existing shadcn `Dialog`/`AlertDialog` components already in `src/components/ui`.
- Storage key and record shape stay backward compatible; new fields are optional and normalized with defaults.
