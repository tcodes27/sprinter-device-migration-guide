import { deviceOrder, workflows } from "@/content/workflows";
import type { DeviceId } from "./workflow-types";
import type { ProgressState } from "./progress";

/**
 * Prototype confirmation codes. Generated on the device, never transmitted.
 * Field Support uses the code to know the Sprinter is done, then verifies in
 * the IRU database and closes the ticket.
 */

/** Unambiguous characters only: no O/0, I/1, L. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const PREFIX: Record<DeviceId, string> = {
  iphone: "IPH",
  "ipad-mini": "MIN",
  "patient-ipad": "PAD",
};

function randomBlock(len: number): string {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i]! % ALPHABET.length];
  return out;
}

export function deviceConfirmationCode(device: DeviceId): string {
  return `${PREFIX[device]}-${randomBlock(4)}-${new Date().getFullYear()}`;
}

function hashBlock(seed: string, salt: number): string {
  let h = (0x811c9dc5 ^ salt) >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  let out = "";
  let x = h;
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[x % ALPHABET.length];
    x = (Math.floor(x / ALPHABET.length) ^ (h >>> (i + 1))) >>> 0;
  }
  return out;
}

/** One code covering the whole migration. Deterministic from the device codes, so it never changes once issued. */
export function masterCodeFor(s: ProgressState): string | null {
  if (!deviceOrder.every((d) => s[d].finished && s[d].confirmationCode)) return null;
  const seed = deviceOrder.map((d) => s[d].confirmationCode).join("|");
  return `SH-${hashBlock(seed, 1)}-${hashBlock(seed, 2)}-${new Date().getFullYear()}`;
}

/** The block of text the Sprinter pastes into their ticket reply. */
export function summaryText(s: ProgressState): string {
  const master = masterCodeFor(s);
  const lines = ["Sprinter Health device migration complete.", ""];
  if (master) lines.push(`Completion code: ${master}`, "");
  for (const d of deviceOrder) {
    const p = s[d];
    if (p.finished && p.confirmationCode) {
      const when = p.completedAt ? ` (finished ${new Date(p.completedAt).toLocaleString()})` : "";
      lines.push(`${workflows[d].name}: ${p.confirmationCode}${when}`);
    } else {
      lines.push(`${workflows[d].name}: not finished yet`);
    }
  }
  return lines.join("\n");
}
