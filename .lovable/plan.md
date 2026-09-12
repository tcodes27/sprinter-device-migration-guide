# Mobile-first workflow cleanup

## Goal
Make the guide calmer and easier to use on a phone without redesigning its established visual style or changing workflow logic, saved checkpoints, progress, or support routing.

## Changes

### 1. Compact mobile navigation
- Change the main navigation labels to **Devices** and **Help**.
- Keep both controls as accessible touch targets, but reduce their mobile width and visual weight.
- Tighten the Sprinter Health wordmark and navigation spacing so the header fits cleanly at narrow widths and with larger text settings.
- Apply the same clear **Devices** destination anywhere the workflow links back to the device dashboard.

### 2. Make the practice demo optional
- Replace the always-open practice-device area on mobile with a collapsed disclosure labeled **See a practice demo**.
- Expanding it reveals the existing interactive practice device and its **Watch me do it** control; collapsing it returns focus to the task checklist.
- Replace “tap the glowing spot” with accurate language about tapping the highlighted item.
- Keep the practice area visible in the existing desktop split layout unless the compact layout is active.

### 3. Move demo-specific actions into the demo
- Move **Show me bigger** inside the expanded practice-demo area, next to the controls for that demo.
- Move **My screen looks different** into the same area so visual troubleshooting stays with the screen being demonstrated.
- Preserve the existing enlarged view and troubleshooting behavior.

### 4. Reduce instruction overload
- Remove **Why?** and **What happens next?** from workflow steps.
- Keep the current title, short introduction, saved task checklist, progress indicators, and primary continue action.
- Leave required warnings, TestFlight instructions, permission guidance, and Field Support callouts intact.

### 5. Fix mobile Field Support behavior
- Prevent the floating Help control from overlapping the fixed workflow actions.
- Use a smaller mobile Help control while retaining the current larger desktop treatment.
- Present Field Support as a phone-friendly panel with a prominent, labeled **Close** action.
- Keep long support content independently scrollable, keep the close action reachable, and restore the user to the same workflow position after closing.
- Preserve all current prototype support paths and saved progress.

### 6. Mobile verification
- Check the home screen and active workflows at the current 393 × 852 phone size and a narrower phone width.
- Verify headers do not wrap or clip, disclosures open and close correctly, support content scrolls, controls do not overlap, and the fixed workflow actions remain usable.
- Confirm desktop still retains the established split workflow layout and all existing interactions continue to work.

## Technical notes
- Reorganize existing presentation components only; no backend, storage, workflow-data, or completion-code changes.
- Use the existing semantic color tokens, button components, motion preferences, focus handling, and checkpoint state.
- Use accessible disclosure semantics with clear expanded/collapsed state and keyboard support.
