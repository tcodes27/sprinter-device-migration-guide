# Make the Migration Guide truly interactive

The wording stays. The experience changes from "read a long page" to "tap along on a practice device that reacts to you."

## What changes

### 1. Tap-along device simulator (the centerpiece)
Every step gets a working mock iPhone / iPad on screen that the Sprinter taps through, exactly mirroring what they do on their real device.

- Each step becomes a short **tap sequence** (e.g. Settings > General > Software Update > Download and Install). The simulator shows the real-looking screen for each stage.
- A soft pulsing glow marks where to tap. Tapping the right spot animates to the next screen (slide, like iOS). Tapping the wrong spot gently wiggles and shows "Try tapping here" with an arrow.
- Waiting stages (update installing, Remote Management configuring) show a live progress animation on the device with "This is normal, it's not frozen."
- "Watch me do it" button auto-plays the tap sequence on the simulator, then hands control back for the user to try.
- "Show me" enlarges the simulator; "My screen looks different" and "Why?" stay, but appear as small pills next to the current instruction.

### 2. Split layout: device left, instructions right
- Desktop: simulator on the left (sticky), on the right a single highlighted "Do this now" instruction card with the sub-actions listed underneath. Sub-actions check themselves off as the user taps through the simulator.
- Mobile: simulator on top, instructions below; the sticky bottom bar holds Back / Next.
- Progress bar with step dots is sticky at the top; header shrinks to the logo + device name.
- "Next" button fills in (goes from outline to solid, with an animated checkmark) once the tap sequence is finished. It can still be pressed early via "I already did this."
- Reset safety gate stays but becomes a full-screen pause with a "hold to confirm" style press so it can't be dismissed accidentally.

### 3. Home page becomes a launcher
- Three large tappable device cards (existing illustrations) with a progress ring on each (0% / 40% / Done). Tap to jump straight into where you left off.
- One short line of context and a small "What is this?" pill that opens the migration explanation as a sheet. The long explanatory sections, flow diagram, and notice cards are removed from Home and moved to the Help page.
- "Continue where I left off" appears at the top when there is saved progress.
- The My Devices page merges into this launcher (route kept as a redirect).

### 4. Feedback and delight (measured)
- Animated checkmark drawing on each completed sub-action and step.
- Progress ring fills smoothly; step dots pop when reached.
- Device completion: soft card flip to a "Device ready" state with a gentle sparkle, no confetti.
- All animations respect reduced-motion.

## Technical details

- New `simulator` content model in `src/lib/workflow-types.ts`: each step gets `sequence: SimScreen[]` where a screen has rows/buttons with a `target` flag and a `next` pointer; waiting screens have `autoAdvanceMs`. Existing `Screen` type remains for fallback.
- `src/content/workflows.ts`: author tap sequences for all 30 steps (iPhone, iPad Mini, Patient iPad) using the existing wording; iOS-style screens: Settings list, General, Software Update, Transfer or Reset, Erase confirmation, Hello/Setup, Remote Management, Wi-Fi, Apple ID, Home screen, TestFlight, permission prompts.
- New components: `DeviceSimulator.tsx` (state machine: idle / awaiting-tap / animating / waiting / done; wrong-tap wiggle; auto-play; reduced-motion), `SimScreenRenderer.tsx` (list / message / wait / home / prompt / progress screens), `InstructionPanel.tsx` (current sub-action highlight, auto-check), `StepShell.tsx` (sticky progress top, sticky action bar bottom, split grid `lg:grid-cols-[minmax(0,420px)_1fr]`), `ProgressRing.tsx`, `DeviceLauncher.tsx`, `HoldToConfirm.tsx`.
- `StepView.tsx` refactored to use StepShell + DeviceSimulator; Why / What next / Troubleshoot / Help / TestFlight / Permissions / Completion panels preserved.
- `src/lib/progress.ts`: add per-step `simDone` so a finished tap sequence persists on reload.
- Routes: `index.tsx` rewritten as launcher; `devices.tsx` redirects to `/`; `help.tsx` gains the moved explanation content; `demo.tsx` updated for new layout.
- Motion via existing `motion` package; iOS slide transitions with `AnimatePresence`; all timers cleaned on unmount.
- Verify at 390px and 1280px widths with Playwright, plus a full iPhone run-through.
