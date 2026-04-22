import { Link, useLocation } from "react-router-dom";
import { Home, Compass, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/readings", label: "Explore", icon: Compass },
  { to: "/history", label: "History", icon: BookOpen },
];

export const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-md px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto">
        <div className="flex items-center justify-between rounded-full border border-border/60 bg-card/88 px-2 py-2.5 shadow-soft backdrop-blur-xl">
          {links.map(({ to, label, icon: Icon }) => {
            // "Explore" lights up on the readings library and on every
            // draw / reading / insight surface — they all live under
            // exploring readings.
            const active =
              to === "/"
                ? path === "/"
                : to === "/readings"
                  ? path.startsWith("/readings") ||
                    path.startsWith("/draw") ||
                    path.startsWith("/reading") ||
                    path.startsWith("/insight") ||
                    path.startsWith("/life-areas")
                  : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex min-w-[5.25rem] flex-col items-center gap-1 rounded-full px-4 py-1.5 transition-smooth",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-smooth",
                    active && "scale-110",
                  )}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
