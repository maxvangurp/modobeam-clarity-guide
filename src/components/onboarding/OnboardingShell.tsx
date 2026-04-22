import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { ModobeamLogo } from "@/components/ModobeamLogo";
import { cn } from "@/lib/utils";
import { layout } from "@/lib/layout";

interface Props {
  step: number;
  total: number;
  onBack?: () => void;
  children: ReactNode;
}

export const OnboardingShell = ({ step, total, onBack, children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-dawn">
      <header className="sticky top-0 z-30 bg-background/48 backdrop-blur-xl">
        <div className={cn(layout.shellInner, "flex h-15 items-center justify-between") }>
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth -ml-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <ModobeamLogo />
          )}
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {step} / {total}
          </span>
        </div>
        <div className={cn(layout.shellInner, "pb-4") }>
          <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/70 transition-all duration-700 ease-out"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className={cn(layout.shellInner, "flex flex-1 flex-col pb-12 pt-6") }>
        {children}
      </main>
    </div>
  );
};
