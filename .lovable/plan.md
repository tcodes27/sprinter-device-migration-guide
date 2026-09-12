# Dismissible floating Help control

## Goal
Make the floating purple Help control feel aligned and unobtrusive while preserving the permanent Help destination in the main navigation.

## Changes

### 1. Refine the floating control
- Tighten the spacing between the life-ring icon and the **Help** wording across phone, tablet, and desktop sizes.
- Vertically align the icon and wording and slightly reduce the extra desktop/tablet width without changing the established purple treatment or touch-target size.

### 2. Add a dismiss action
- Add a clearly separated close icon on the front/right side of the floating Help control.
- Keep the main portion opening Field Support; clicking close only hides the floating control and does not open Help or alter progress.
- Give both actions clear accessible names and keyboard focus behavior.

### 3. Restore it on navigation
- Keep the floating control hidden for the remainder of the current screen after dismissal.
- Automatically show it again after any page change, including Back or returning to **Devices**.
- Leave the permanent **Help** navigation destination available while the floating control is hidden.

### 4. Verify presentation and behavior
- Check the control at phone, tablet, and desktop widths for alignment, spacing, readable labels, and non-overlap with fixed workflow actions.
- Verify opening Help, closing the Help panel, dismissing the floating control, and its return after navigation.

## Technical notes
- Keep dismissal temporary in in-memory interface state; do not persist it or change saved workflow data.
- Use the existing button styles, semantic colors, motion preferences, and Field Support behavior.