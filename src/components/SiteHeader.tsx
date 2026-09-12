import { Link } from "@tanstack/react-router";
import { Home, LifeBuoy, Smartphone } from "lucide-react";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/devices", label: "My Devices", icon: Smartphone },
  { to: "/help", label: "Need Help", icon: LifeBuoy },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" aria-label="Sprinter Health Device Migration home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary sm:flex-row sm:gap-2 sm:text-sm"
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
