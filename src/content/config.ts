/**
 * IT-configurable values.
 * Change these without touching UI code.
 */

/**
 * CURRENT APPROVED SOFTWARE VERSION
 * Leave null until Sprinter Health IT explicitly approves a version.
 * When null, the guide tells Sprinters to check the version in their IT instructions.
 * Example when approved: "iOS 18.4"
 */
export const approvedSoftwareVersion: string | null = null;

export const versionCheck = {
  title: "Update complete?",
  intro: "Let's make sure your device finished updating.",
  question: "Does your device show the expected software version?",
  fallbackInstruction: "Check that your device is running the version specified in your IT instructions.",
  approvedInstruction: (v: string) => `Your device should show ${v}.`,
  path: ["Settings", "General", "Software Update"],
  lookFor: "Look for the software version shown on your device.",
  matches: "It matches",
  noMatch: "It does not match",
  dontKnow: "I don't know",
  noMatchHelp: [
    "Go back to Settings → General → Software Update.",
    "If an update is still available, tap Download and Install and wait for it to finish.",
    "If the update fails or nothing changes after two tries, stop and contact Field Support.",
  ],
};

/** Field Support prototype labels */
export const support = {
  demoBadge: "Demo / Prototype",
  demoNote: "This is a demonstration. No message is actually sent.",
  followUpEmail: "We'll send you a follow-up email confirming that your devices are up to date.",
};
