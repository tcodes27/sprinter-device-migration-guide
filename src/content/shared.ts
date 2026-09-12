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
  eyebrow: "Check one more time",
  title: "Did your IT message tell you to reset this device?",
  updated: "Your device is updated.",
  next: "Now we'll erase and reset it.",
  body: "This process will erase the device and require you to set it up again. Make sure this matches the instructions you received from Sprinter Health IT.",
  unsure: "Do not continue if you are unsure.",
  confirm: "Yes — continue",
  back: "No — go back",
  help: "I need help",
};

export const pathChoice = {
  question: "What did the IT message ask you to do?",
  hint: "Choose the option that matches the instructions you received from Sprinter Health IT.",
  update: { title: "Update only", body: "Update the device software." },
  reset: { title: "Update + Reset", body: "Update the device and then erase/reset it." },
  confirm: {
    eyebrow: "Important",
    title: "You selected Update + Reset.",
    body: "Make sure this matches the instructions you received from Sprinter Health IT.",
    warning: "This process will erase the device and require you to set it up again.",
    yes: "Yes — this is what IT said",
    back: "Go back",
  },
};

export const deviceChooser = {
  title: "Choose your device",
  subtitle: "Select the device IT asked you to update.",
  important: "The steps may be different for each device.",
  outline: ["Update", "Reset if required", "Set up", "Verify"],
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
  rule: "Open the invitation email directly on the device you are working on. Do not open it on another device unless Field Support tells you to.",
  install: [
    "Open the Sprinter Health invitation email on this device.",
    "Tap “View in TestFlight”. This opens TestFlight.",
    "Sign in with your Sprinter Health email if prompted.",
    "On the Sprinter Health page, tap Install.",
    "Review and accept the app permissions.",
    "Allow location access.",
    "Allow camera access.",
    "Allow notifications.",
    "Open the Sprinter Health app.",
    "Sign in with your Sprinter Health email.",
  ],
  update: [
    "Open the Sprinter Health invitation email on this device.",
    "Tap “View in TestFlight”. This opens TestFlight.",
    "Sign in with your Sprinter Health email if prompted.",
    "On the Sprinter Health page, tap Update.",
    "Wait for the update to finish.",
    "Open the Sprinter Health app and sign in with your Sprinter Health email.",
  ],
  installVsUpdate: "If you already have the Sprinter Health app installed and an update is available, you may see UPDATE instead of INSTALL. That is not an error.",
  redeemCode: {
    title: "Having trouble with TestFlight?",
    warning: "Don't guess or enter a random code.",
    steps: [
      "Make sure you're using your Sprinter Health Apple account.",
      "Open the invitation directly on the affected device.",
      "If you see a Redeem Code screen, go back and open the TestFlight invitation again.",
    ],
    still: "Still need help?",
  },
};

export const testflightAfterErase = {
  title: "After Erase: Reinstall Sprinter Health",
  eyebrow: "AFTER YOUR DEVICE IS ERASED",
  intro:
    "After your iPad or iPhone is erased, the Sprinter Health app will be removed. You will need to install it again using the TestFlight invitation email you received from Sprinter Health.",
  steps: [
    {
      title: "Find your TestFlight invitation email",
      body: "After your device is erased and set up again, open the work email account on the device. Find the email from Sprinter Health that says you have been invited to test the Sprinter Health app.",
      note: "Do not look for the app on the Home Screen. It was removed when the device was erased.",
    },
    {
      title: "Tap ‘View in TestFlight’",
      body: "Open the Sprinter Health invitation email on the device. Tap the blue ‘View in TestFlight’ button in the email.",
      warning: "Open the email directly on the iPad or iPhone. Do not open the link from a computer.",
    },
    {
      title: "Open the Sprinter Health app in TestFlight",
      body: "TestFlight will open and show the Sprinter Health app. If prompted, sign in with the Apple Account being used on the device.",
    },
    {
      title: "Tap Install",
      body: "On the Sprinter Health app page in TestFlight, tap the blue ‘Install’ button. Wait for the app to finish installing.",
      note: "For an app that is already installed, the button may say ‘Update’ instead.",
    },
    {
      title: "Accept the app permissions",
      body: "When Sprinter Health asks for permission to use Location, Camera, Notifications, or other required features, tap Allow / OK / Continue as prompted.",
      important:
        "If you are setting up more than one device, it is best to complete the iPad setup first. Sometimes permissions do not sync correctly between devices. If TestFlight or the Sprinter Health app shows an error on one device, continue setting up the other device first and accept the requested permissions there. Then return to the device showing the error and try the TestFlight link again.",
    },
    {
      title: "Open Sprinter Health",
      body: "Once the app is installed, tap Open. Sign in using your Sprinter Health work email when prompted.",
    },
  ],
  errorCard: {
    title: "Seeing an error?",
    bullets: [
      "Make sure you opened the TestFlight invitation email on the device itself.",
      "Make sure you are using the correct Sprinter Health Apple Account.",
      "If another device is still being set up, finish that device and accept the requested permissions first.",
      "Return to the TestFlight invitation email and tap ‘View in TestFlight’ again.",
      "If the problem continues, reply to your support ticket or contact Field Support.",
    ],
  },
  successCard: {
    title: "App Installed!",
    body: "Once the Sprinter Health app is installed, open it and sign in with your Sprinter Health work email. You are ready to continue setup.",
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
