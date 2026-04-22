import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ModobeamLogo } from "./ModobeamLogo";
import { AmbientBackground } from "./AmbientBackground";
import { Link } from "react-router-dom";
import { ChevronLeft, Settings2 } from "lucide-react";
import type { MomentNeed } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { layout } from "@/lib/layout";

/**
 * The four screen-level color moods. Each one layers a soft radial wash
 * above the global ambient background, giving every surface its own
 * emotional atmosphere without breaking calmness.
 */
export type ScreenMood = "draw" | "reveal" | "reflect" | "history" | null;

interface Props {
  children: ReactNode;
  showNav?: boolean;
  showBack?: boolean;
  backTo?: string;
  ambientMoment?: MomentNeed | null;
  /** Adds a layered, screen-specific color wash on top of the ambient drift. */
  screenMood?: ScreenMood;
}

const MOOD_CLASS: Record<NonNullable<ScreenMood>, string> = {
  draw: "bg-mood-draw",
  reveal: "bg-mood-reveal",
  reflect: "bg-mood-reflect",
  history: "bg-mood-history",
};

export const AppShell = ({
  children,
  showNav = true,
  showBack = false,
  backTo,
  ambientMoment = null,
  screenMood = null,
}: Props) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AmbientBackground moment={ambientMoment} />
      {screenMood && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none fixed inset-0 -z-[5] transition-opacity duration-1000",
            MOOD_CLASS[screenMood],
          )}
        />
      )}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/72 backdrop-blur-xl">
        <div className={cn(layout.shellInner, "flex h-15 items-center justify-between") }>
          {showBack ? (
            <Link
              to={backTo ?? "/"}
              className="-ml-1 inline-flex items-center gap-1 text-sm text-muted-foreground transition-smooth hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          ) : (
            <ModobeamLogo descriptor="Daily Clarity" />
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

      <main className={cn(layout.shellInner, "flex-1 pb-32 pt-5") }>
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};
