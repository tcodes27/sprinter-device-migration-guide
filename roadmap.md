# Roadmap

## Support + routing + multi-device (current)

- [x] Global Field Support center (floating button, menu, chat, text request, "I can't continue", post-completion variant) with location context
- [x] Device chooser modal → "What did IT ask you to do?" → reset confirmation → routing
- [x] Path-aware steps (Update only vs Update + Reset), Update verification / version check step
- [x] "You are here" breadcrumb, patient-facing info card, reset "check one more time" gate copy
- [x] Device complete → another device? dialog; /complete "You're all set" page; dashboard statuses
- [x] TestFlight copy (full flow, install vs update, redeem-code workaround)
- [x] Verify (typecheck, build, Playwright desktop + mobile)

## Required TestFlight step after reset

- [x] Add a visible reset-only TestFlight reinstall step for all three devices
- [x] Place it after setup/configuration and before final verification
- [x] Use persistent task checkpoints and the original invitation-email process
- [x] Verify reset and update-only paths on desktop and mobile

## Proof of completion

- [x] Per-device confirmation codes issued on finish, persisted across refresh
- [x] Master completion code + copyable summary on "You're all set" for the Field Support ticket reply
- [x] Verify in browser (codes appear, copy works, refresh keeps them)

## Mobile-first workflow cleanup

- [x] Compact the mobile header labels and sizing
- [x] Collapse the practice demo by default on mobile
- [x] Move visual troubleshooting and enlargement controls into the demo
- [x] Remove optional Why and What happens next controls
- [x] Prevent Help and workflow actions from overlapping
- [x] Verify mobile and desktop layouts and interactions
