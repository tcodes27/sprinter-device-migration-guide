# Make TestFlight a required after-reset step

## Goal
Make the TestFlight reinstall instructions easy to find and show them only when a Sprinter chose **Update + Reset**. The flow will apply to the iPhone, iPad Mini, and Patient-Facing iPad.

## Workflow placement
For each device, add a dedicated **Reinstall Sprinter Health** step after the erased device has finished setup/configuration and before the final device check.

```text
Update → Reset → Set up again → Reinstall Sprinter Health with TestFlight → Verify device
```

- Include this step only in the **Update + Reset** path.
- Do not show the after-erase reinstall flow in **Update only**.
- Keep each device's existing reset and setup instructions unchanged.

## TestFlight experience
- Present the TestFlight content directly on the page instead of hiding it inside the collapsed “Need help with TestFlight?” panel.
- Keep the existing normal TestFlight install/update instructions as Section 1.
- Place **After Erase: Reinstall Sprinter Health** directly after it as Section 2.
- Clearly state that the app disappearing is expected after an erase.
- Keep the original TestFlight invitation email as the starting point and do not make Redeem Code the primary path.
- Preserve the existing warning, permissions guidance, error checklist, Field Support action, and green success message.

## Checkpoints and progress
- Turn the reinstall actions into the same persistent task checklist used throughout the guide.
- Let the Sprinter check each TestFlight task as it is completed.
- Save progress so leaving, refreshing, or returning resumes at the first unfinished reinstall task.
- Require all reinstall tasks to be confirmed before the step advances to final verification.

## Technical details
- Add a reset-only TestFlight workflow step to all three device definitions.
- Separate normal TestFlight help from the after-erase required step so visibility follows the selected workflow path.
- Reuse the existing checkpoint, progress, support, and design patterns; no backend or new route is needed.

## Verification
- Test all three devices through **Update + Reset** and confirm the TestFlight step appears after setup and before verification.
- Test all three devices through **Update only** and confirm the after-erase reinstall step does not appear.
- Confirm the TestFlight sections are expanded and readable, task checks persist after refresh, and Field Support remains available.
- Check desktop and mobile layouts and confirm the project builds without errors.
