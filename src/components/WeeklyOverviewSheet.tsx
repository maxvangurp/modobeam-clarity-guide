import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WeeklyInsightsPanel } from "@/components/WeeklyInsightsPanel";
import type { DayCell } from "@/lib/weekProgress";
import type { ThemeInsight } from "@/lib/progression";
import type { WeeklySynthesis } from "@/lib/weeklySynthesis";
import type { MomentNeed } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface WeeklyOverviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  week: DayCell[];
  reflectionCount: number;
  checkedInDays: number;
  weekRangeLabel: string;
  themes: ThemeInsight[];
  momentCounts: Array<{ moment: MomentNeed; count: number }>;
  synthesis: WeeklySynthesis | null;
  takeaways: string[];
  repeatedFocusArea: string | null;
  surfaceClassName?: string;
}

export function WeeklyOverviewSheet({
  open,
  onOpenChange,
  week,
  reflectionCount,
  checkedInDays,
  weekRangeLabel,
  themes,
  momentCounts,
  synthesis,
  takeaways,
  repeatedFocusArea,
  surfaceClassName,
}: WeeklyOverviewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "inset-x-auto left-1/2 right-auto bottom-3 max-h-[88vh] w-[calc(100vw-1rem)] max-w-[980px] -translate-x-1/2 overflow-y-auto rounded-[1.7rem] border border-border/60 bg-background/96 px-0 backdrop-blur-xl [&>button]:hidden md:bottom-5 md:w-[calc(100vw-2rem)]",
          surfaceClassName,
        )}
      >
        <div className="px-5 pb-6 pt-3">
          <SheetHeader className="text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/58">
                  This week
                </p>
                <SheetTitle className="mt-1 max-w-[12ch] font-display text-[2rem] font-semibold leading-[0.96] text-foreground">
                  Reflection insights.
                </SheetTitle>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/82">
                  {weekRangeLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close weekly overview"
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/62 bg-background/84 text-muted-foreground transition-smooth hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </SheetHeader>

          <div className="mt-5">
            <WeeklyInsightsPanel
              week={week}
              weekRangeLabel={weekRangeLabel}
              reflectionCount={reflectionCount}
              checkedInDays={checkedInDays}
              themes={themes}
              momentCounts={momentCounts}
              synthesis={synthesis}
              takeaways={takeaways}
              repeatedFocusArea={repeatedFocusArea}
              surfaceClassName={surfaceClassName}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}