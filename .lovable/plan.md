# Proof of Completion: confirmation codes (no screenshots, no transmission)

Right now the finish screen just says "You're all set". Field Support has no clear signal that a Sprinter is done. Per your direction: confirmation codes only. Field Support will verify in the IRU database and close the ticket, so nothing needs to be transmitted and no screenshot upload is needed.

## What the Sprinter will see

**On each device's final screen (after the last step is checked)**

1. A green "Device complete" card appears with a **device confirmation code**, e.g. `IPH-4K7Q-2026` (device prefix, short random block, year). Big, easy to read.
2. A "Copy code" button.
3. Plain instruction: "Copy this confirmation code and send it in your reply to Field Support. This lets them know your device is finished."

**On the "You're all set" screen**

1. One **master completion code** covering the whole migration, e.g. `SH-8FQ3-XR21-2026`, generated once all devices are finished. This is the single code Field Support closes the ticket against after checking the IRU database.
2. A summary list: each device name, its own code, and the date/time it was finished. Unfinished devices show "Not finished yet" instead of a code, so nobody sends a half-done confirmation.
3. A **Copy completion summary** button: copies a clean block of text (master code + per-device codes + finish dates) they can paste straight into their ticket reply.
4. Clear framing text: "Send this code in your reply to Field Support. They will confirm everything is recorded and close your ticket."
5. Codes are generated once and never change; they survive refresh, leaving, and returning.

## Prototype honesty

Nothing is transmitted and nothing is validated against a real system. The existing "Demo / Prototype" badge stays on all support surfaces. Codes exist only so the Sprinter has something concrete to send back, and so the experience matches the future flow where Field Support checks the IRU database.

## Technical notes

- `src/lib/progress.ts`: add per-device `confirmationCode` and `completedAt`, plus a state-level `masterCode`. Codes generated lazily the first time a device (or the whole migration) finishes, persisted in the existing localStorage save; `normalize()` defaults missing fields for older saves.
- New `src/lib/confirmation.ts`: code generation (crypto-random, no confusing characters like O/0 or I/1) and a `summaryText()` formatter for the copy button.
- New `src/components/ConfirmationCode.tsx`: reusable card (code display + copy button with "Copied" feedback + instruction text). Used on the device final step and on `/complete`.
- `src/components/StepView.tsx`: render the card on the final step once all checkpoints are complete.
- `src/routes/complete.tsx`: master code, per-device code list, copy-summary button, and framing copy.
- No backend, no Cloud, no uploads, no network calls.
