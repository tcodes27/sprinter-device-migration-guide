import { Link } from "@tanstack/react-router";
import { LifeBuoy, Smartphone } from "lucide-react";
import { Logo } from "./Logo";

const nav = [
  {
    to: "/",
    label: "Devices",
    ariaLabel: "Devices, return to the main device screen",
    icon: Smartphone,
  },
  { to: "/help", label: "Help", ariaLabel: "Help and Field Support", icon: LifeBuoy },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <Link to="/" aria-label="Sprinter Health Device Migration home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {nav.map(({ to, label, ariaLabel, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={ariaLabel}
              className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
              activeProps={{ className: "bg-primary-soft text-primary" }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
