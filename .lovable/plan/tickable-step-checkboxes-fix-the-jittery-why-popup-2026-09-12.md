# Tickable step checkboxes + fix the jittery "Why?" popup

## 1. Let the Sprinter check off each step

In the "What to do" list beside the practice device, each line gets a real, tappable checkbox:

- Empty rounded checkbox on every step instead of a plain number badge (the number stays visible next to the label).
- Tapping a checkbox fills it green with an animated check mark and dims/strikes the line, exactly like the way steps look when completed automatically.
- Tapping again un-checks it, in case they tap by mistake.
- Steps completed by tapping through the practice device still auto-check, and manual checks merge with those.
- Manual checks are saved with the rest of their progress, so leaving and coming back keeps the marks.
- Full keyboard and screen-reader support (real button with checked state, clear label).

This is purely a "where am I" aid — it does not skip ahead or unlock the Next button on its own.

## 2. Fix the "Why?" pop-up jitter

The "Why?" and "What happens next?" bubbles currently shake/fly around. Cause: the "Got it" button inside the bubble is registered as a second opener for the same bubble, so the bubble keeps re-anchoring to itself. Replacing it with a proper close button stops the movement and makes "Got it" simply dismiss the bubble.

## Technical notes

- `src/components/InstructionPanel.tsx`: replace the static number badge with a `button` toggle; state comes from props (`checked: number[]`, `onToggle(i)`), derived display = `done || i < index || checked.includes(i)`. Keep the existing `draw-check` / success token styling and reduced-motion behaviour.
- `src/components/StepView.tsx`: hold per-step manual checks, pass them into `InstructionPanel`.
- `src/lib/progress.ts`: persist manual checks per device+step (extend the existing v3 store shape, defaulting to empty so old saved progress still loads).
- `src/components/StepView.tsx` `WhyPopover`: swap the nested `PopoverTrigger` around "Got it" for `PopoverPrimitive.Close` (export `PopoverClose` from `src/components/ui/popover.tsx`).
- Verify: typecheck, build log, and Playwright pass over a workflow step at 1280px and 390px, checking a box, un-checking it, and opening/closing the "Why?" bubble.
