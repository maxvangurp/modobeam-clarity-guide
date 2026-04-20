import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ModobeamLogo } from "./ModobeamLogo";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface Props {
  children: ReactNode;
  showNav?: boolean;
  showBack?: boolean;
  backTo?: string;
}

export const AppShell = ({
  children,
  showNav = true,
  showBack = false,
  backTo,
}: Props) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="mx-auto max-w-md px-5 h-14 flex items-center justify-between">
          {showBack ? (
            <Link
              to={backTo ?? "/"}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth -ml-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          ) : (
            <ModobeamLogo />
          )}
          {!isHome && !showBack && <ModobeamLogo />}
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md px-5 pb-32 pt-4">
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};
