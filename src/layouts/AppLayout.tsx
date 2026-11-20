import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  Compass,
  Home,
  Map as MapIcon,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CAMPUS } from "@/data/campus";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/ai", label: "AI", icon: Bot },
  { to: "/navigate", label: "Navigate", icon: MapIcon },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 hidden border-b border-border bg-background/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/home" className="flex items-center gap-2">
            <span className="brand-surface grid size-8 place-items-center rounded-lg text-sm font-bold">
              C
            </span>
            <span className="font-display text-lg font-semibold">CampusAI</span>
            <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
              {CAMPUS.code}
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 md:px-6 md:pb-12">
        <Outlet />
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition-colors",
                      active && "bg-accent",
                    )}
                  >
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
