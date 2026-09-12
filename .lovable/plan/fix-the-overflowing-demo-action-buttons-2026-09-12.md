# Fix the overflowing demo action buttons

## Goal
Stop the "My screen looks different" button text/icon from spilling outside its pill on desktop, without changing what the buttons do.

## Cause
On desktop the practice-demo card is a narrow side column (~440px), but "Show me bigger" and "My screen looks different" are forced into two side-by-side columns (~196px each). The buttons keep their labels on one line, so the longer label overflows the pill whenever the column is too tight (smaller desktop windows, browser zoom, or enlarged text).

## Changes
- Stack the two demo action buttons vertically inside the practice-demo card at all widths, instead of squeezing them into two columns on desktop.
- Make both buttons wrap-safe: allow the label to wrap to a second line, keep the icon from shrinking, and let the button grow taller instead of overflowing.
- Keep the buttons inside the practice-demo area with the same styles, order, and behavior (enlarged view and troubleshooting dialog unchanged).

## Verification
- Check a mid-workflow step at 1024px, 1280px, and 1449px desktop widths, plus phone widths.
- Repeat at browser zoom 125-150% to confirm the label wraps inside the pill instead of spilling.
- Confirm both buttons still open the enlarged view and the troubleshooting dialog.
