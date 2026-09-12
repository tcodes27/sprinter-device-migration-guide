import type { DeviceId, DeviceWorkflow, WorkflowStep } from "@/lib/workflow-types";

/* ------------------------------------------------------------------ */
/* Shared step pieces (kept as helpers so each device stays separate)  */
/* ------------------------------------------------------------------ */

const updateWhy = {
  title: "Why do I need to update first?",
  body: "Updating first helps make sure your device has the software needed for the next part of the process.",
};

const resetWhy = {
  title: "Why do I need to erase the device?",
  body: "Erasing lets the device join the new system with a clean start. This is expected during this migration.",
};

const configWhy = {
  title: "Why does this take a while?",
  body: "Your device is connecting to Sprinter Health's device management system and downloading what it needs. This can take several minutes.",
};

/* ------------------------------------------------------------------ */
/* iPHONE                                                              */
/* ------------------------------------------------------------------ */

const iphoneSteps: WorkflowStep[] = [
  {
    id: "update",
    title: "Update your iPhone",
    intro: "Before we reset your iPhone, update it first.",
    todo: [
      "Open Settings.",
      "Tap General.",
      "Tap Software Update.",
      "If an update is available, tap Download and Install.",
      "Wait for the update to finish.",
    ],
    screen: {
      kind: "list",
      title: "General",
      rows: [{ label: "About" }, { label: "Software Update", highlight: true }, { label: "AirDrop" }, { label: "Storage" }],
    },
    lookFor: "Software Update",
    why: updateWhy,
    whatNext: "After the update finishes, you will erase the iPhone and set it up again. This is expected.",
    nextLabel: "Update is done — start reset",
  },
  {
    id: "reset",
    title: "Erase & reset your iPhone",
    intro: "Now we erase the iPhone so it can join the new system.",
    resetGate: true,
    todo: [
      "Open Settings.",
      "Tap General.",
      "Scroll down and tap Transfer or Reset iPhone.",
      "Tap Erase All Content and Settings.",
      "Follow the prompts on the screen.",
    ],
    screen: {
      kind: "list",
      title: "Transfer or Reset iPhone",
      rows: [{ label: "Prepare for New iPhone" }, { label: "Reset" }, { label: "Erase All Content and Settings", highlight: true }],
    },
    lookFor: "Erase All Content and Settings",
    why: resetWhy,
    whatNext: "The iPhone will ask you to confirm. Then it will restart and show a Hello screen.",
    nextLabel: "Continue to confirm",
    troubleshoot: {
      noButton: "Make sure you are in Settings → General, then scroll all the way down. If you still don't see it, contact Field Support.",
    },
  },
  {
    id: "confirm-reset",
    title: "Confirm the reset",
    intro: "The iPhone will ask you to confirm. This is expected.",
    todo: [
      "Tap Continue.",
      "If asked, enter your iPhone passcode.",
      "Tap Erase iPhone to confirm.",
      "Wait — the iPhone will restart on its own.",
    ],
    screen: { kind: "message", title: "Erase This iPhone", body: "All content and settings will be removed.", button: "Erase iPhone", highlight: true },
    lookFor: "Erase iPhone",
    whatNext: "The screen goes dark, then shows an Apple logo. This can take a few minutes.",
    nextLabel: "I confirmed the reset",
    troubleshoot: {
      error: "If you see a message about an account or passcode you don't recognize, stop here. Do not guess. Contact Field Support.",
    },
  },
  {
    id: "hello",
    title: "Wait for the Hello screen",
    intro: "After the iPhone restarts, you'll see a screen that says Hello.",
    todo: ["Keep the iPhone plugged in.", "Wait for the Hello screen.", "Swipe up or press Home to begin."],
    screen: { kind: "message", title: "Hello", body: "Swipe up to open", highlight: true },
    lookFor: "Hello",
    whatNext: "Next you'll choose your language and region.",
    nextLabel: "I see Hello — start setup",
    troubleshoot: {
      stuck: "A dark screen or Apple logo for a few minutes is normal. Keep it plugged in. If nothing changes after 10 minutes, contact Field Support.",
    },
  },
  {
    id: "language",
    title: "Choose language & region",
    intro: "Pick your language and country.",
    todo: ["Tap English (or your language).", "Tap United States (or your region).", "Tap Continue if asked."],
    screen: { kind: "list", title: "Language", rows: [{ label: "English", highlight: true }, { label: "Español" }, { label: "Français" }] },
    lookFor: "English",
    nextLabel: "Connect to Wi-Fi",
  },
  {
    id: "wifi",
    title: "Connect to Wi-Fi",
    intro: "The iPhone needs Wi-Fi for the next steps.",
    todo: ["Tap the Wi-Fi network you were told to use.", "Enter the Wi-Fi password if asked.", "Wait for the checkmark.", "Tap Next."],
    screen: { kind: "list", title: "Choose a Wi-Fi Network", rows: [{ label: "Your Wi-Fi network", highlight: true }, { label: "Other network" }] },
    lookFor: "A checkmark next to your network",
    whatNext: "After Wi-Fi connects, the iPhone will ask you to sign in.",
    nextLabel: "I'm connected — sign in",
    troubleshoot: {
      error: "Double-check the Wi-Fi password. If you're not sure which network to use, contact Field Support.",
    },
  },
  {
    id: "signin",
    title: "Sign in with your Sprinter Health email",
    intro: "Use the Sprinter Health account IT gave you.",
    todo: ["Enter your Sprinter Health email address.", "Tap Next.", "Enter your password.", "Complete any sign-in prompt you normally use."],
    screen: { kind: "message", title: "Sign in", body: "Sprinter Health", button: "Next", highlight: true },
    lookFor: "The Sprinter Health sign-in page",
    why: { title: "Why do I sign in here?", body: "Signing in tells the new system this is your Sprinter Health iPhone so it can set things up for you." },
    whatNext: "The iPhone will start configuring itself. This part takes a while and is normal.",
    nextLabel: "I signed in",
    troubleshoot: {
      error: "This means the device could not complete the sign-in step. Do not keep trying random options. Contact Field Support so we can help.",
    },
  },
  {
    id: "configure",
    kind: "waiting",
    title: "Device configuration",
    intro: "Your device is being configured. This may take several minutes.",
    todo: ["Keep the iPhone connected to power.", "Do not restart it unless instructed.", "Wait until the screen moves on by itself."],
    screen: { kind: "wait", title: "Configuring your iPhone…", body: "Sprinter Health is setting up your device." },
    why: configWhy,
    whatNext: "When it finishes, the iPhone will ask you to finish a few setup items like a passcode.",
    nextLabel: "It finished — continue setup",
    troubleshoot: {
      stuck: "This step really can take several minutes. Keep the device plugged in. If it hasn't moved after 20 minutes, contact Field Support.",
    },
  },
  {
    id: "setup",
    title: "Continue setup",
    intro: "Follow the on-screen instructions. You may be asked for a few things.",
    todo: ["Create a passcode if asked.", "Set up Face ID if asked.", "Set up your authenticator app if asked.", "Wait for apps to install."],
    screen: { kind: "list", title: "Finish setting up", rows: [{ label: "Passcode" }, { label: "Face ID" }, { label: "Authenticator" }, { label: "Apps installing…", highlight: true }] },
    lookFor: "Apps appearing on your home screen",
    extras: ["testflight", "permissions"],
    whatNext: "Last step: we check that your iPhone is ready.",
    nextLabel: "Verify my iPhone",
  },
  {
    id: "verify",
    kind: "complete",
    title: "You're all set",
    intro: "Check your home screen. You should see your expected Sprinter Health apps.",
    todo: ["Look at your home screen.", "Make sure the Sprinter Health apps are there.", "Open one app to make sure it starts."],
    screen: { kind: "home", title: "Home", apps: ["Sprinter", "Mail", "Slack", "Authenticator", "Settings", "Phone"] },
    lookFor: "Your Sprinter Health apps",
    nextLabel: "Finish",
  },
];

/* ------------------------------------------------------------------ */
/* iPAD MINI                                                           */
/* ------------------------------------------------------------------ */

const ipadMiniSteps: WorkflowStep[] = [
  {
    id: "update",
    title: "Update your iPad Mini",
    intro: "Before anything else, update the iPad Mini.",
    todo: ["Open Settings on the iPad.", "Tap General in the left column.", "Tap Software Update.", "If an update is available, tap Download and Install.", "Wait for the update to finish."],
    screen: { kind: "list", title: "General", rows: [{ label: "About" }, { label: "Software Update", highlight: true }, { label: "AirDrop" }, { label: "iPad Storage" }] },
    lookFor: "Software Update",
    why: updateWhy,
    whatNext: "If IT asked you to reset this iPad, you'll do that next. If not, you'll skip ahead.",
    nextLabel: "Update is done",
  },
  {
    id: "reset",
    title: "Reset your iPad Mini (if required)",
    intro: "Only do this if IT asked you to reset this iPad.",
    resetGate: true,
    todo: ["Open Settings.", "Tap General.", "Scroll down and tap Transfer or Reset iPad.", "Tap Erase All Content and Settings.", "Follow the prompts."],
    screen: { kind: "list", title: "Transfer or Reset iPad", rows: [{ label: "Prepare for New iPad" }, { label: "Reset" }, { label: "Erase All Content and Settings", highlight: true }] },
    lookFor: "Erase All Content and Settings",
    why: resetWhy,
    whatNext: "The iPad will ask you to confirm, then restart.",
    nextLabel: "Continue to confirm",
  },
  {
    id: "confirm-reset",
    title: "Confirm the reset",
    intro: "The iPad will ask you to confirm. This is expected.",
    todo: ["Tap Continue.", "Enter the iPad passcode if asked.", "Tap Erase iPad.", "Wait — the iPad restarts on its own."],
    screen: { kind: "message", title: "Erase This iPad", body: "All content and settings will be removed.", button: "Erase iPad", highlight: true },
    lookFor: "Erase iPad",
    nextLabel: "I confirmed the reset",
  },
  {
    id: "power-on",
    title: "Power on & wait for Hello",
    intro: "After the restart, the iPad shows a Hello screen.",
    todo: ["Keep the iPad plugged in.", "Wait for the Hello screen.", "Press the Home button or swipe up."],
    screen: { kind: "message", title: "Hello", body: "Press home to open", highlight: true },
    lookFor: "Hello",
    nextLabel: "I see Hello — start setup",
  },
  {
    id: "language",
    title: "Choose language & region",
    intro: "Pick your language and country.",
    todo: ["Tap English (or your language).", "Tap United States (or your region)."],
    screen: { kind: "list", title: "Language", rows: [{ label: "English", highlight: true }, { label: "Español" }] },
    lookFor: "English",
    nextLabel: "Connect to Wi-Fi",
  },
  {
    id: "wifi",
    title: "Connect to Wi-Fi",
    intro: "The iPad needs Wi-Fi for the next steps.",
    todo: ["Tap the Wi-Fi network you were told to use.", "Enter the password if asked.", "Wait for the checkmark.", "Tap Next."],
    screen: { kind: "list", title: "Choose a Wi-Fi Network", rows: [{ label: "Your Wi-Fi network", highlight: true }, { label: "Other network" }] },
    lookFor: "A checkmark next to your network",
    nextLabel: "I'm connected — sign in",
  },
  {
    id: "account",
    title: "Sign in with your Sprinter Health account",
    intro: "Use the Sprinter Health account IT gave you.",
    todo: ["Enter your Sprinter Health email.", "Tap Next.", "Enter your password.", "Complete any sign-in prompt you normally use."],
    screen: { kind: "message", title: "Sign in", body: "Sprinter Health", button: "Next", highlight: true },
    lookFor: "The Sprinter Health sign-in page",
    whatNext: "The iPad will configure itself. This takes a while and is normal.",
    nextLabel: "I signed in",
    troubleshoot: { error: "This means the iPad could not complete the sign-in step. Do not keep trying random options. Contact Field Support." },
  },
  {
    id: "configure",
    kind: "waiting",
    title: "Device configuration",
    intro: "Your iPad is being configured. This may take several minutes.",
    todo: ["Keep the iPad connected to power.", "Do not restart it unless instructed.", "Wait until the screen moves on by itself."],
    screen: { kind: "wait", title: "Configuring your iPad…", body: "Sprinter Health is setting up your device." },
    why: configWhy,
    nextLabel: "It finished — continue setup",
  },
  {
    id: "setup",
    title: "Finish setup",
    intro: "Follow the on-screen instructions.",
    todo: ["Create a passcode if asked.", "Set up Touch ID or Face ID if asked.", "Wait for apps to install."],
    screen: { kind: "list", title: "Finish setting up", rows: [{ label: "Passcode" }, { label: "Touch ID" }, { label: "Apps installing…", highlight: true }] },
    lookFor: "Apps appearing on your home screen",
    extras: ["testflight", "permissions"],
    nextLabel: "Verify my iPad Mini",
  },
  {
    id: "verify",
    kind: "complete",
    title: "You're all set",
    intro: "Check the home screen for your Sprinter Health apps.",
    todo: ["Look at the home screen.", "Make sure the Sprinter Health apps are there.", "Open one app to make sure it starts."],
    screen: { kind: "home", title: "Home", apps: ["Sprinter", "Mail", "Slack", "Settings", "Safari", "Photos"] },
    lookFor: "Your Sprinter Health apps",
    nextLabel: "Finish",
  },
];

/* ------------------------------------------------------------------ */
/* PATIENT-FACING iPAD                                                 */
/* ------------------------------------------------------------------ */

const patientIpadSteps: WorkflowStep[] = [
  {
    id: "update",
    title: "Update the Patient-Facing iPad",
    intro: "This is the larger iPad used during patient visits. Update it first.",
    todo: ["Open Settings.", "Tap General in the left column.", "Tap Software Update.", "If an update is available, tap Download and Install.", "Wait for the update to finish."],
    screen: { kind: "list", title: "General", rows: [{ label: "About" }, { label: "Software Update", highlight: true }, { label: "AirDrop" }, { label: "iPad Storage" }] },
    lookFor: "Software Update",
    why: updateWhy,
    nextLabel: "Update is done",
  },
  {
    id: "reset",
    title: "Reset the Patient-Facing iPad (if required)",
    intro: "Only do this if IT asked you to reset this iPad.",
    resetGate: true,
    todo: ["Open Settings.", "Tap General.", "Scroll down and tap Transfer or Reset iPad.", "Tap Erase All Content and Settings.", "Follow the prompts."],
    screen: { kind: "list", title: "Transfer or Reset iPad", rows: [{ label: "Prepare for New iPad" }, { label: "Reset" }, { label: "Erase All Content and Settings", highlight: true }] },
    lookFor: "Erase All Content and Settings",
    why: resetWhy,
    nextLabel: "Continue to confirm",
  },
  {
    id: "confirm-reset",
    title: "Confirm the reset",
    intro: "The iPad will ask you to confirm. This is expected.",
    todo: ["Tap Continue.", "Enter the iPad passcode if asked.", "Tap Erase iPad.", "Wait — the iPad restarts on its own."],
    screen: { kind: "message", title: "Erase This iPad", body: "All content and settings will be removed.", button: "Erase iPad", highlight: true },
    lookFor: "Erase iPad",
    nextLabel: "I confirmed the reset",
  },
  {
    id: "start-setup",
    title: "Start setup",
    intro: "After the restart, the iPad shows a Hello screen.",
    todo: ["Keep the iPad plugged in.", "Wait for the Hello screen.", "Press the Home button or swipe up."],
    screen: { kind: "message", title: "Hello", body: "Press home to open", highlight: true },
    lookFor: "Hello",
    nextLabel: "I see Hello — start setup",
  },
  {
    id: "language",
    title: "Choose language & region",
    intro: "Pick your language and country.",
    todo: ["Tap English (or your language).", "Tap United States (or your region)."],
    screen: { kind: "list", title: "Language", rows: [{ label: "English", highlight: true }, { label: "Español" }] },
    lookFor: "English",
    nextLabel: "Connect to Wi-Fi",
  },
  {
    id: "wifi",
    title: "Connect to Wi-Fi",
    intro: "The iPad needs Wi-Fi for the next steps.",
    todo: ["Tap the Wi-Fi network you were told to use.", "Enter the password if asked.", "Wait for the checkmark.", "Tap Next."],
    screen: { kind: "list", title: "Choose a Wi-Fi Network", rows: [{ label: "Your Wi-Fi network", highlight: true }, { label: "Other network" }] },
    lookFor: "A checkmark next to your network",
    nextLabel: "I'm connected",
  },
  {
    id: "account",
    title: "Account & configuration",
    intro: "Sign in with the Sprinter Health account IT gave you for this iPad.",
    todo: ["Enter the Sprinter Health email for this iPad.", "Tap Next.", "Enter the password.", "Complete any sign-in prompt shown."],
    screen: { kind: "message", title: "Sign in", body: "Sprinter Health", button: "Next", highlight: true },
    lookFor: "The Sprinter Health sign-in page",
    extras: ["authError"],
    whatNext: "The iPad will configure itself. This takes a while and is normal.",
    nextLabel: "I signed in",
    troubleshoot: { error: "This means the device could not complete the sign-in step. Do not keep trying random options. Contact Field Support so we can help." },
  },
  {
    id: "wait",
    kind: "waiting",
    title: "Please wait",
    intro: "Your iPad is being configured. This may take several minutes.",
    todo: ["Keep the iPad connected to power.", "Do not restart it unless instructed.", "Wait until the screen moves on by itself."],
    screen: { kind: "wait", title: "Configuring your iPad…", body: "Sprinter Health is setting up your device." },
    why: configWhy,
    nextLabel: "It finished — continue",
  },
  {
    id: "auth",
    title: "Authentication (if required)",
    intro: "The iPad may ask you to sign in one more time. That is normal.",
    todo: ["If asked, sign in again with the same Sprinter Health account.", "Complete any sign-in prompt shown.", "If nothing is asked, just continue."],
    screen: { kind: "message", title: "Verify it's you", body: "Sprinter Health", button: "Continue", highlight: true },
    lookFor: "A sign-in or verification prompt",
    extras: ["authError"],
    nextLabel: "Verify the iPad",
    troubleshoot: { error: "This means the device could not complete the sign-in step. Do not keep trying random options. Contact Field Support so we can help." },
  },
  {
    id: "verify",
    title: "Verify the iPad",
    intro: "Check the home screen for the patient-visit apps.",
    todo: ["Look at the home screen.", "Make sure the Sprinter Health patient apps are there.", "Open one app to make sure it starts."],
    screen: { kind: "home", title: "Home", apps: ["Sprinter Visit", "Settings", "Safari", "Camera"] },
    lookFor: "Your patient-visit apps",
    extras: ["testflight", "permissions"],
    nextLabel: "Everything looks right",
  },
  {
    id: "complete",
    kind: "complete",
    title: "You're all set",
    intro: "The Patient-Facing iPad has completed the migration steps.",
    nextLabel: "Finish",
  },
];

/* ------------------------------------------------------------------ */

export const workflows: Record<DeviceId, DeviceWorkflow> = {
  iphone: {
    id: "iphone",
    name: "iPhone",
    shortName: "iPhone",
    description: "Your Sprinter Health iPhone",
    startLabel: "Update iPhone",
    frame: "phone",
    steps: iphoneSteps,
    completionChecklist: ["Device updated", "Reset completed if required", "Setup completed", "Configuration completed", "Device checked"],
  },
  "ipad-mini": {
    id: "ipad-mini",
    name: "iPad Mini",
    shortName: "iPad Mini",
    description: "Your smaller iPad",
    startLabel: "Update iPad Mini",
    frame: "tablet",
    steps: ipadMiniSteps,
    completionChecklist: ["Device updated", "Reset completed if required", "Setup completed", "Configuration completed", "Device checked"],
  },
  "patient-ipad": {
    id: "patient-ipad",
    name: "Patient-Facing iPad",
    shortName: "Patient iPad",
    description: "The larger iPad used during patient visits",
    startLabel: "Update Patient-Facing iPad",
    frame: "tablet-wide",
    steps: patientIpadSteps,
    completionChecklist: ["Device updated", "Reset completed if required", "Setup completed", "Configuration completed", "Device checked"],
  },
};

export const deviceOrder: DeviceId[] = ["iphone", "ipad-mini", "patient-ipad"];

export function isDeviceId(v: string): v is DeviceId {
  return v in workflows;
}
