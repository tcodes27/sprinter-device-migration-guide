# Fix the mobile action button

## Goal
Keep the bottom action button readable at phone widths without changing what it does.

## Changes
- Replace the long mobile-only label “Sprinter Health is installed” with the concise “App installed”; retain the full wording on larger screens.
- Constrain and center the label so the completion checkmark and forward arrow cannot cover or clip it.
- Preserve the existing Back, Pause, progress, and next-step behavior.

## Verification
- Check the affected iPhone step at 393 × 852 and 360px wide.
- Confirm the label, checkmark, and arrow do not overlap, and the button still advances correctly.
