import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ModobeamLogo } from "./ModobeamLogo";
import { Link } from "react-router-dom";
import { ChevronLeft, Settings2 } from "lucide-react";

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
          <Link
            to="/preferences"
            aria-label="Preferences"
            className="text-muted-foreground hover:text-foreground transition-smooth p-2 -mr-2"
          >
            <Settings2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md px-5 pb-32 pt-4">
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};
