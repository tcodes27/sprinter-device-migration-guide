# Proof of Completion: confirmation codes + screenshot upload

Right now the finish screen just says "You're all set". Nothing gives Field Support proof they can close the ticket with. I recommend doing both, because they serve different purposes:

- A **confirmation code** is what the Sprinter sends back in the ticket reply. It is short, typo-resistant, and unique per person.
- A **screenshot of the finished device** is the visual proof that the app actually opened and is signed in.

## What the Sprinter will see

**On each device's final screen (after the last step)**

1. A "Send proof to Field Support" card appears once every task on that device is checked.
2. A device confirmation code, e.g. `IPH-4K7Q-2026` (device prefix, short random block, year). Big, easy to read, with a "Copy code" button.
3. An "Add a photo or screenshot of the finished app screen" button. They pick an image from the device; a thumbnail shows with a green check. It is stored on the device only in this prototype, nothing is uploaded anywhere.
4. Plain instruction: "Reply to your Field Support ticket with this code and photo."

**On the "You're all set" screen**

1. One **master completion code** covering the whole migration, e.g. `SH-2026-8FQ3-XR21`. This is the single number Field Support can close the ticket against.
2. A summary list: each device, its own code, whether a photo was attached, and the date/time it was finished.
3. Buttons: **Copy completion summary** (copies a clean block of text they can paste straight into an email or ticket reply) and **Send to Field Support** (opens the existing Field Support request panel with the summary pre-filled, still marked Demo / Prototype).
4. Codes and photos survive a refresh; they are generated once and never change for that migration.

If a device is not finished yet, its row shows "Not finished yet" instead of a code, so nobody sends a half-done confirmation.

## Prototype honesty

Nothing is actually transmitted. Every send action keeps the existing "Demo / Prototype" badge and the note that no message is sent. Codes are generated on the device and saved locally.

## Technical notes

- `src/lib/progress.ts`: add per-device `confirmationCode`, `completedAt`, `photoName`/`photoDataUrl`, plus a state-level `masterCode`. Generated lazily on first completion, persisted in the existing localStorage save; `normalize()` keeps older saves working (missing fields default to empty).
- New `src/lib/confirmation.ts`: code generation (device prefix + crypto-random base32 block), master code, and a `summaryText()` formatter used by copy and by the pre-filled support request.
- New `src/components/ProofOfCompletion.tsx`: the reusable card (code, copy button, photo picker via a hidden `<input type="file" accept="image/*">`, thumbnail). Used on the device final step and on `/complete`.
- `src/components/StepView.tsx`: render the card on the final step once all checkpoints are complete.
- `src/routes/complete.tsx`: master code, per-device summary table, copy button, and a Field Support hand-off that calls the existing `useSupport().open()` with the summary as the issue/message.
- Photos are downscaled to a small JPEG data URL before saving so localStorage does not blow past its quota.
- No backend, no Cloud, no network calls.
