import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { layout } from "@/lib/layout";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/check-in", label: "Check-in", icon: Sparkles },
  { to: "/readings", label: "Explore", icon: Compass },
  { to: "/history", label: "History", icon: BookOpen },
];

export const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className={cn(layout.shellInner, "pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto") }>
        <div className="flex items-center justify-between rounded-full border border-border/75 bg-card/95 px-2.5 py-2.5 shadow-card backdrop-blur-xl">
          {links.map(({ to, label, icon: Icon }) => {
            // "Explore" lights up on the readings library and on every
            // draw / reading / insight surface — they all live under
            // exploring readings.
            const active =
              to === "/"
                ? path === "/"
                : to === "/check-in"
                  ? path === "/check-in"
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
                  "flex min-w-[5.4rem] flex-col items-center gap-1 rounded-full px-4 py-2.5 transition-smooth",
                  active
                    ? "bg-background/78 text-foreground shadow-[inset_0_1px_0_hsl(var(--background)/0.88)]"
                    : "text-muted-foreground/92 hover:text-foreground",
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
                <span className="text-[10px] font-medium tracking-[0.04em]">
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
