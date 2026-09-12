# Add "After Erase" TestFlight reinstall section

## Goal
Add a second, clearly-labeled TestFlight guide section for devices that were erased or factory reset, directly after the existing install/update guide. Keep the existing iPhone/iPad TestFlight instructions untouched.

## What will change

### 1. Content (`src/content/shared.ts`)
- Add a new `testflightAfterErase` object with:
  - intro warning about the app disappearing after erase
  - 7 numbered steps (find email, open link, open TestFlight, install, accept permissions, open app, error troubleshooting)
  - multi-device permissions note
  - the "Seeing an error?" troubleshooting bullets
  - final green success card copy
- Keep the existing `testflight` object unchanged except for any small connector wording needed between the two sections.

### 2. Component (`src/components/StepView.tsx`)
- Replace the single `TestFlightPanel` with a two-section guide.
- Add a small visual distinction:
  - Section 1 label: "Install or Update Sprinter Health" — normal flow.
  - Section 2 label: "After Erase: Reinstall Sprinter Health" — post-reset flow.
- Render the new section using the same card/list styling as the existing panel:
  - numbered steps with circular step markers
  - highlighted notes/callouts using `bg-primary-soft` and warning-style boxes
  - simple 6th-grade language
  - purple/blue branded accents via existing Tailwind tokens
- Prominently display the "Seeing an error?" card inside section 2.
- Add the final green "App Installed!" success card.
- Do not introduce a redeem-code primary path; error card points back to the original invitation email and Field Support.

### 3. Styling
- Reuse existing design tokens (`bg-primary-soft`, `border-warning/40`, `bg-success-soft`, etc.).
- No new color values or hard-coded hex colors.
- Keep mobile-friendly stacked layout and large tap targets.

## Out of scope
- No backend, messaging API, or chatbot integration.
- No changes to existing device chooser, simulator, progress, or support flows.
- No new routes.

## Verification
- Run TypeScript check.
- Open a workflow step that shows the TestFlight guide and confirm both sections appear, section 2 renders all 7 steps plus error card plus success card, and the existing section 1 still works.
