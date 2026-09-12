import type { DeviceId, SimItem, SimScreen } from "@/lib/workflow-types";

/**
 * Tap-along sequences for the practice device.
 * Each device's steps are generated from the same building blocks so wording
 * stays consistent; edit the helpers below to change what the simulator shows.
 */

type DeviceCopy = {
  name: string; // "iPhone" | "iPad"
  resetRow: string; // "Transfer or Reset iPhone"
  eraseTitle: string; // "Erase This iPhone"
  eraseButton: string; // "Erase iPhone"
  biometric: string; // "Face ID" | "Touch ID"
  apps: string[];
  helloLabel: string;
};

const row = (label: string, extra: Partial<SimItem> = {}): SimItem => ({ label, ...extra });
const T = (label: string, extra: Partial<SimItem> = {}): SimItem => ({ label, target: true, ...extra });

function common(c: DeviceCopy) {
  const home = (hint = "Tap Settings"): SimScreen => ({
    kind: "home",
    hint,
    apps: [...c.apps.slice(0, 5), "Settings"].map((a) => (a === "Settings" ? T(a) : row(a))),
  });

  const settings = (): SimScreen => ({
    kind: "list",
    hint: "Tap General",
    title: "Settings",
    items: [row("Wi-Fi", { value: "Connected" }), row("Bluetooth", { value: "On" }), T("General"), row("Display & Brightness"), row("Privacy & Security")],
  });

  const general = (target: "Software Update" | "reset"): SimScreen => ({
    kind: "list",
    hint: target === "reset" ? `Scroll down and tap ${c.resetRow}` : "Tap Software Update",
    title: "General",
    back: "Settings",
    items:
      target === "reset"
        ? [row("About"), row("Software Update"), row("AirDrop"), row(`${c.name} Storage`), T(c.resetRow)]
        : [row("About"), T("Software Update"), row("AirDrop"), row(`${c.name} Storage`)],
  });

  return { home, settings, general };
}

export function buildSequences(c: DeviceCopy): Record<string, SimScreen[]> {
  const { home, settings, general } = common(c);

  const update: SimScreen[] = [
    home(),
    settings(),
    general("Software Update"),
    { kind: "prompt", hint: "Tap Download and Install", title: "iOS Update Available", body: "This update includes important improvements.", buttons: [T("Download and Install"), row("Later")] },
    { kind: "progress", hint: "Wait for the update to finish", title: "Installing update…", body: `Your ${c.name} will restart when it is done.`, durationMs: 2600 },
    { kind: "final", hint: "Your device is up to date", title: "Up to date", body: `Your ${c.name} has the latest software.` },
  ];

  const reset: SimScreen[] = [
    home(),
    settings(),
    general("reset"),
    { kind: "list", hint: "Tap Erase All Content and Settings", title: c.resetRow, back: "General", items: [row(`Prepare for New ${c.name}`), row("Reset"), T("Erase All Content and Settings", { destructive: true })] },
    { kind: "final", hint: `You will see “${c.eraseTitle}”`, title: c.eraseTitle, body: "Apps, data, and settings will be removed. The next step walks you through confirming." },
  ];

  const confirmReset: SimScreen[] = [
    { kind: "prompt", hint: "Tap Continue", title: c.eraseTitle, body: "Apps & Data · Settings · Accounts", buttons: [T("Continue")] },
    { kind: "prompt", hint: `Enter your ${c.name} passcode if asked`, title: "Enter Passcode", field: "● ● ● ● ● ●", buttons: [T("Enter passcode")] },
    { kind: "prompt", hint: `Tap ${c.eraseButton} to confirm`, title: `${c.eraseButton}?`, body: "This cannot be undone.", buttons: [T(c.eraseButton, { destructive: true }), row("Cancel")] },
    { kind: "progress", hint: `Wait, the ${c.name} restarts on its own`, title: "Erasing…", body: "The screen goes dark, then shows an Apple logo.", durationMs: 2400 },
    { kind: "final", hint: "The device is restarting", title: "Restarting", body: "This can take a few minutes. Keep it plugged in." },
  ];

  const hello: SimScreen[] = [
    { kind: "hello", hint: c.helloLabel, label: c.helloLabel },
    { kind: "final", hint: "Setup begins", title: "Let's set up", body: "Next you'll choose your language and region." },
  ];

  const language: SimScreen[] = [
    { kind: "list", hint: "Tap English (or your language)", title: "Language", items: [T("English"), row("Español"), row("Français"), row("中文")] },
    { kind: "list", hint: "Tap United States (or your region)", title: "Select Your Country or Region", items: [T("United States"), row("Canada"), row("Mexico")] },
    { kind: "final", hint: "Language and region are set", title: "Language set", body: "English · United States" },
  ];

  const wifi: SimScreen[] = [
    { kind: "list", hint: "Tap the Wi-Fi network you were told to use", title: "Choose a Wi-Fi Network", items: [T("Your Wi-Fi network"), row("Other network"), row("Guest")] },
    { kind: "prompt", hint: "Enter the Wi-Fi password, then tap Join", title: "Enter Password", field: "● ● ● ● ● ● ● ●", buttons: [T("Join"), row("Cancel")] },
    { kind: "list", hint: "Wait for the checkmark, then tap Next", title: "Choose a Wi-Fi Network", items: [row("Your Wi-Fi network", { checked: true }), row("Other network"), row("Guest")], footer: T("Next") },
    { kind: "final", hint: "Connected to Wi-Fi", title: "Connected", body: "Your Wi-Fi network" },
  ];

  const signin: SimScreen[] = [
    { kind: "prompt", hint: "Enter your Sprinter Health email, then tap Next", title: "Sign in", body: "Sprinter Health", field: "you@sprinterhealth.com", buttons: [T("Next")] },
    { kind: "prompt", hint: "Enter your password, then tap Sign in", title: "Enter password", body: "Sprinter Health", field: "● ● ● ● ● ● ● ● ●", buttons: [T("Sign in")] },
    { kind: "prompt", hint: "Complete any sign-in prompt you normally use", title: "Approve sign-in", body: "Check your authenticator app.", buttons: [T("Approve")] },
    { kind: "final", hint: "Signed in", title: "Signed in", body: `The new system now knows this is your Sprinter Health ${c.name}.` },
  ];

  const configure: SimScreen[] = [
    { kind: "progress", hint: "Keep the device on power and wait", title: `Configuring your ${c.name}…`, body: "Sprinter Health is setting up your device. This is not frozen.", durationMs: 3200 },
    { kind: "final", hint: "Configuration finished", title: "Configuration complete", body: "The device moves on by itself." },
  ];

  const setup: SimScreen[] = [
    { kind: "prompt", hint: "Create a passcode if asked", title: "Create a Passcode", field: "● ● ● ● ● ●", buttons: [T("Continue")] },
    { kind: "prompt", hint: `Set up ${c.biometric} if asked`, title: c.biometric, body: `Use ${c.biometric} to unlock quickly.`, buttons: [T("Continue"), row("Set Up Later")] },
    { kind: "prompt", hint: "Set up your authenticator app if asked", title: "Authenticator", body: "Follow the prompt to link your account.", buttons: [T("Continue")] },
    { kind: "progress", hint: "Wait for apps to install", title: "Installing apps…", body: "Sprinter Health apps are being added.", durationMs: 2600 },
    { kind: "final", hint: "Apps are on your home screen", title: "Apps installed", apps: c.apps },
  ];

  const verify: SimScreen[] = [
    { kind: "home", hint: `Tap ${c.apps[0]} to make sure it opens`, apps: [...c.apps.slice(0, 5), "Settings"].map((a, i) => (i === 0 ? T(a) : row(a))) },
    { kind: "final", hint: "The app opens", title: c.apps[0] ?? "Sprinter", body: "It starts normally. You're all set." },
  ];

  const auth: SimScreen[] = [
    { kind: "prompt", hint: "If asked, sign in again with the same account", title: "Verify it's you", body: "Sprinter Health", buttons: [T("Continue")] },
    { kind: "prompt", hint: "Complete any sign-in prompt shown", title: "Approve sign-in", body: "Check your authenticator app.", buttons: [T("Approve")] },
    { kind: "final", hint: "Verified", title: "Verified", body: "You can move on." },
  ];

  const complete: SimScreen[] = [{ kind: "final", hint: "Device ready", title: "Device ready", body: "All migration steps are complete.", apps: c.apps }];

  return {
    update,
    reset,
    "confirm-reset": confirmReset,
    hello,
    "power-on": hello,
    "start-setup": hello,
    language,
    wifi,
    signin,
    account: signin,
    configure,
    wait: configure,
    setup,
    verify,
    auth,
    complete,
  };
}

export const deviceCopy: Record<DeviceId, DeviceCopy> = {
  iphone: {
    name: "iPhone",
    resetRow: "Transfer or Reset iPhone",
    eraseTitle: "Erase This iPhone",
    eraseButton: "Erase iPhone",
    biometric: "Face ID",
    apps: ["Sprinter", "Mail", "Slack", "Authenticator", "Phone"],
    helloLabel: "Swipe up to open",
  },
  "ipad-mini": {
    name: "iPad",
    resetRow: "Transfer or Reset iPad",
    eraseTitle: "Erase This iPad",
    eraseButton: "Erase iPad",
    biometric: "Touch ID",
    apps: ["Sprinter", "Mail", "Slack", "Safari", "Photos"],
    helloLabel: "Press home to open",
  },
  "patient-ipad": {
    name: "iPad",
    resetRow: "Transfer or Reset iPad",
    eraseTitle: "Erase This iPad",
    eraseButton: "Erase iPad",
    biometric: "Touch ID",
    apps: ["Sprinter Health", "Safari", "Camera", "Photos", "Mail"],
    helloLabel: "Press home to open",
  },
};
