import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DeviceId } from "./workflow-types";

/** Where the Sprinter is right now. Every support surface reads this so nobody has to explain themselves twice. */
export type SupportLocation = {
  deviceId?: DeviceId;
  deviceName: string;
  /** e.g. "Update + Reset" */
  processLabel?: string;
  stepNumber?: number;
  stepTotal?: number;
  stepTitle?: string;
  /** The exact sub-action they're on, e.g. "Tap Software Update" */
  currentAction?: string;
  percent?: number;
  /** True once this device's steps are finished */
  completed?: boolean;
};

export type SupportView = "menu" | "after" | "chat" | "request" | "stop" | "sent";

export type OpenOptions = { view?: SupportView; issue?: string };

type Ctx = {
  location: SupportLocation | null;
  setLocation: (loc: SupportLocation | null) => void;
  isOpen: boolean;
  view: SupportView;
  issue: string;
  setView: (v: SupportView) => void;
  setIssue: (s: string) => void;
  open: (opts?: OpenOptions) => void;
  close: () => void;
};

const SupportContext = createContext<Ctx | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<SupportLocation | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [view, setView] = useState<SupportView>("menu");
  const [issue, setIssue] = useState("");

  const open = useCallback((opts?: OpenOptions) => {
    setView(opts?.view ?? "menu");
    setIssue(opts?.issue ?? "");
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<Ctx>(
    () => ({ location, setLocation, isOpen, view, issue, setView, setIssue, open, close }),
    [location, isOpen, view, issue, open, close],
  );
  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport must be used inside SupportProvider");
  return ctx;
}

/** Register the current location while a screen is mounted. Cleared on unmount. */
export function useSupportLocation(loc: SupportLocation | null) {
  const { setLocation } = useSupport();
  const key = JSON.stringify(loc);
  useEffect(() => {
    setLocation(loc);
    return () => setLocation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setLocation]);
}
