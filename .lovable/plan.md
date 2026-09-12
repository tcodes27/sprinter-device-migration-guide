# Fix app name + remove AI-style em dashes

Two cleanup items across the whole project:

## 1. "Sprinter Visit" → "Sprinter Health"

The simulated device home screens label the app "Sprinter Visit". Rename it to "Sprinter Health" everywhere it appears:

- `src/content/sequences.ts` — home screen app list ("Sprinter Visit" → "Sprinter Health")
- `src/content/workflows.ts` — home screen app list (same change)
- Sweep the rest of `src/` for any other "Sprinter Visit" occurrences so the app name is consistent everywhere (buttons, dialogs, simulator hints, support copy)

## 2. Remove em dashes ("—") from all user-visible copy

Em dashes appear throughout the app's text and give it an AI-generated feel. Replace every em dash in user-visible strings with natural punctuation (comma, period, colon, or rewording), e.g.:

- "Yes — continue" → "Yes, continue"
- "Wait — the iPad restarts on its own" → "Wait. The iPad restarts on its own."
- "Update is done — check it" → "Update is done. Check it."
- "Stop — let's get help" → "Stop. Let's get help."

Files affected (user-visible copy):

- `src/content/shared.ts`, `src/content/workflows.ts`, `src/content/sequences.ts`
- `src/components/SupportCenter.tsx`, `StepView.tsx`, `VersionCheck.tsx`, `InstructionPanel.tsx`, `TroubleshootDialog.tsx`, `ReportIssueForm.tsx`, `DeviceLauncher.tsx`, `HoldToConfirm.tsx`, `SimScreenRenderer.tsx`, `DeviceSimulator.tsx`
- `src/routes/index.tsx`, `complete.tsx`, `help.tsx`, `demo.tsx`, `device.$deviceId.tsx`, `__root.tsx`

Em dashes inside code comments will also be cleaned up where touched, but the focus is everything a Sprinter can read on screen.

## Verify

- `tsgo --noEmit` passes, build reports OK
- Playwright: confirm the home screen shows "Sprinter Health" and spot-check buttons/cards show the new punctuation on desktop and mobile
