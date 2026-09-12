import type { TroubleChoice } from "@/lib/workflow-types";

/** Editable, non-device-specific content. */

export const orgName = "Sprinter Health";
export const appName = "Device Migration Guide";

export const whyMigration = {
  headline: "We are moving your Sprinter Health devices to a new system that helps IT manage and support your devices.",
  whatIsMigration: "Migration means moving your device from one system to another.",
  needsSteps: "Your device needs to complete a few steps so it can work with the new system.",
  important:
    "Please complete the steps when IT asks you to. If you skip the required update or reset, your device may have problems working correctly.",
  whyItMatters:
    "Completing these steps helps make sure your Sprinter Health devices continue to work properly and remain ready for patient visits.",
  ifSkipped:
    "If required updates or resets are not completed, your device may eventually have problems connecting to required services, receiving updates, or working properly during patient visits.",
  otherProblems:
    "If your device is already having problems with connectivity, apps, updates, or other issues, please tell IT now.",
  howYouAreAsked:
    "You may receive a message from Sprinter Health IT asking you to update your device.",
  whenAsked: "When you receive the request, come back here and choose the device you were asked to update.",
  requestChannels: ["Email from IT", "Slack message from IT", "Other approved IT communication"],
};

export const journey = ["Your device", "Update", "Reset if needed", "Set up again", "Ready"];

export const resetWarning = {
  title: "Before you reset",
  body: "Resetting the device removes the information stored on the device. Make sure you are working on the device IT asked you to update.",
  unsure: "Do not continue if you are unsure.",
  confirm: "Yes — this is the correct device",
  help: "I need help",
};

export const stopRules = [
  "You are unsure which device to update",
  "The screen looks completely different",
  "The device is stuck",
  "You receive an unexpected error",
  "You are asked for information you do not recognize",
  "You are concerned something may be wrong",
];

export const troubleChoices: { id: TroubleChoice; label: string }[] = [
  { id: "noButton", label: "I don't see the button" },
  { id: "error", label: "I see an error" },
  { id: "stuck", label: "My device is stuck" },
  { id: "dontKnow", label: "I don't know what to tap" },
  { id: "other", label: "Something else" },
];

export const defaultTroubleAnswers: Record<TroubleChoice, string> = {
  noButton:
    "Go back one screen and look again slowly. Screens can look a little different on each device. If you still don't see it after two tries, stop here and contact Field Support.",
  error:
    "Don't tap random options. Take a screenshot of the error if you can. Then contact Field Support so we can help.",
  stuck:
    "Wait two full minutes — some steps take longer than they look. Keep the device plugged in. If nothing changes, contact Field Support.",
  dontKnow: "That's okay. Re-read the \"What to do\" list one line at a time. If you're still unsure, contact Field Support. Do not guess.",
  other: "Stop here and contact Field Support. A screenshot of your screen helps us fix it faster.",
};

export const supportMessage = {
  title: "Still need help?",
  body: "That's okay. If something isn't working, contact Field Support. A screenshot of the screen you're seeing can help us troubleshoot faster.",
  note: "Contact details are provided by Sprinter Health IT. If you don't have them, use the message you received from IT.",
};

export const testflight = {
  what: "TestFlight is how Sprinter Health delivers the app to your device.",
  install: [
    "Open the TestFlight invitation on this device.",
    "Tap the invitation link.",
    "Tap Install in TestFlight.",
    "Wait for the app to appear on your home screen.",
  ],
  update: ["Open TestFlight.", "Find the Sprinter Health app.", "Tap Update.", "Wait for the update to finish."],
  redeemCode: {
    title: "Seeing a redeem code?",
    warning: "Don't guess or enter a random code.",
    steps: [
      "Make sure you are using the correct Sprinter Health Apple Account.",
      "Open the invitation email directly on the affected device.",
      "Tap the TestFlight invitation link again.",
      "If the issue continues, contact Field Support.",
    ],
  },
};

export const permissions = [
  { name: "Location", does: "Helps the app know where visits happen.", tap: "Tap Allow While Using App." },
  { name: "Camera", does: "Lets the app take photos when needed for a visit.", tap: "Tap Allow." },
  { name: "Notifications", does: "Lets the app send you important updates.", tap: "Tap Allow." },
];

export const authErrorHelp = {
  title: "What does this mean?",
  body: "This means the device could not complete the sign-in step. Do not keep trying random options. Contact Field Support so we can help.",
};
