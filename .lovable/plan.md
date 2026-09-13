# Replace floating Help with scroll-to-top button

## Goal
Remove the fixed purple "Need help?" floating launcher now that every screen has a clear "Contact Field Support" option in the page content. Replace it with a global scroll-to-top button that appears once the user has scrolled about 30% down the page.

## Changes

### 1. Remove the floating Help launcher
- In `src/components/SupportCenter.tsx`, delete the floating `motion.div` launcher and its dismiss button.
- Delete the `launcherDismissed` state and the `router.subscribe("onResolved", ...)` effect that resets it.
- Keep the `Dialog` and support views intact so every existing "Contact Field Support" button still works exactly as before.

### 2. Add a global scroll-to-top control
- Create `src/components/ScrollToTop.tsx` that:
  - Listens to window scroll and computes scroll progress as `scrollY / (scrollHeight - clientHeight)`.
  - Becomes visible once progress exceeds ~0.30 (30%).
  - Hides again when near the top.
  - Renders a circular floating button with the `ArrowUp` icon.
  - Scrolls `window.scrollTo({ top: 0, behavior: 'smooth' })` on click/tap.
  - Has `aria-label="Back to top"`, visible focus ring, and respects `prefers-reduced-motion`.
- Mount the component once inside `src/routes/__root.tsx` so it is available on every route.
- Position it fixed bottom-right with enough clearance to avoid overlapping the fixed workflow action bar on device pages, while remaining reachable on home/help/complete pages.

### 3. Preserve existing behavior
- All Field Support entry points (page buttons, header Help link, etc.) continue to open the existing support dialog.
- No changes to routing, workflow logic, progress persistence, or support content.
- No backend, AI, or integration work.

## Verification
- Home page: button appears after scrolling past 30%, scrolls to top smoothly, focus ring visible.
- Device workflow page (`/device/ipad-mini` etc.): button does not overlap the fixed bottom action bar; still reachable and functional.
- Help and Complete pages: same scroll threshold and smooth-scroll behavior.
- Mobile widths 360 px and 393 px, tablet, and desktop: button is sized as a 44 px+ touch target and does not obscure primary controls.
- Reduced-motion preference: jump to top instead of smooth scroll.

## Technical details
- Use `lucide-react`'s `ArrowUp` icon.
- Reuse existing `Button` (size icon/sm) and color tokens (`bg-primary text-primary-foreground shadow-float rounded-full`).
- Throttle scroll measurement with `requestAnimationFrame` or a passive `scroll` listener.
- The scroll progress calculation guards against division by zero when the page is not scrollable.
- Component state is local only; nothing is persisted.
