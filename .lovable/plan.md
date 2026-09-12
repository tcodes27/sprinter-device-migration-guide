# GitHub README for Sprinter Health Device Migration Guide

Write a polished, recruiter-friendly README.md that replaces the current placeholder at the project root. The README should explain what the app is, why it exists, and what it demonstrates, without exposing internal Sprinter Health URLs or backend details.

## Plan

1. **Capture screenshots**
   - Use Playwright to capture key screens at desktop and mobile sizes:
     - Home / device launcher
     - Device chooser + "What did IT ask you to do?" path selection
     - Tap-along simulator step with instructions
     - TestFlight after-erase reinstall section
     - Completion screen with master confirmation code
   - Save images to `docs/screenshots/` in the repo so they travel with the README.

2. **Write README.md sections**
   - **Hero**: Project name, one-line value proposition, status badges (e.g. TanStack Start, React, TypeScript, Tailwind CSS, Lovable-built).
   - **What it is**: A self-guided, interactive device-migration assistant for non-technical field staff (Sprinters). Emphasize that it turns IT instructions into a tap-along practice experience so users never feel alone.
   - **Key features** (with screenshots):
     - Multi-device chooser (iPhone, iPad Mini, Patient-Facing iPad)
     - Update-only vs Update + Reset path routing
     - Practice device simulator with tappable targets
     - Persistent task-level checkpoints that survive refresh
     - Contextual Field Support menu / chat / "I can't continue" flows (prototype only)
     - TestFlight install/update + after-erase reinstall guide
     - Per-device and master completion codes for Field Support ticket replies
   - **Tech stack**: TanStack Start, React 19, TypeScript, Tailwind CSS v4, Radix UI, Motion, Zod, localStorage persistence.
   - **Design & UX decisions**: Non-technical language, step-by-step tap-along flow, progress indicators, reset confirmation gate, accessible support always one tap away.
   - **Run locally**: `bun install` (or `npm install`), `bun run dev`, open `http://localhost:8080`.
   - **Prototype note**: Clearly state this is a static demonstration prototype with localStorage only; no backend, no real Field Support transmission, no real device management.
   - **Roadmap snapshot**: Brief bullet list of what has been built from roadmap.md.

3. **Optimize and verify**
   - Compress screenshots to keep the repo lightweight.
   - Preview the rendered README in a markdown viewer to confirm headings, image paths, and formatting are clean.
   - Ensure no public URLs, no internal credentials, and no "Lovable App" placeholder copy remains.
