import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/draw/daily", label: "Draw", icon: Sparkles },
  { to: "/history", label: "History", icon: BookOpen },
];

export const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto">
        <div className="flex items-center justify-around rounded-full border border-border/60 bg-card/85 backdrop-blur-xl shadow-soft py-2 px-2">
          {links.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/"
                ? path === "/"
                : to.startsWith("/draw")
                  ? path.startsWith("/draw") || path.startsWith("/insight")
                  : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-5 py-2 rounded-full transition-smooth",
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
