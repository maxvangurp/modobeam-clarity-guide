import { ArrowRight, Sparkles, Waypoints } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WeekProgress } from "@/components/WeekProgress";
import type { DayCell } from "@/lib/weekProgress";
import type { ThemeInsight } from "@/lib/progression";
import type { WeeklySynthesis } from "@/lib/weeklySynthesis";
import type { MomentNeed } from "@/lib/profile";
import { MOMENT_LABELS } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface WeeklyOverviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  week: DayCell[];
  reflectionCount: number;
  checkedInDays: number;
  themes: ThemeInsight[];
  momentCounts: Array<{ moment: MomentNeed; count: number }>;
  synthesis: WeeklySynthesis | null;
  takeaways: string[];
  surfaceClassName?: string;
}

export function WeeklyOverviewSheet({
  open,
  onOpenChange,
  week,
  reflectionCount,
  checkedInDays,
  themes,
  momentCounts,
  synthesis,
  takeaways,
  surfaceClassName,
}: WeeklyOverviewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "max-h-[85vh] overflow-y-auto rounded-t-[1.7rem] border-border/60 bg-background/96 px-0 backdrop-blur-xl",
          surfaceClassName,
        )}
      >
        <div className="px-5 pb-6 pt-3">
          <SheetHeader className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/58">
              This week
            </p>
            <SheetTitle className="max-w-[12ch] font-display text-[2rem] font-semibold leading-[0.96] text-foreground">
              Your weekly pattern.
            </SheetTitle>
            <SheetDescription className="max-w-[30ch] text-[13px] leading-[1.62] text-muted-foreground/92">
              A compact view of what you&apos;ve returned to, how often you checked in, and what the app is holding onto.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-[1.15rem] border border-border/65 bg-background/82 px-3.5 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/56">
                Reflections
              </p>
              <p className="mt-2 font-display text-[1.5rem] leading-none text-foreground">
                {reflectionCount}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/88">Saved this week</p>
            </div>
            <div className="rounded-[1.15rem] border border-border/65 bg-background/82 px-3.5 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/56">
                Days checked in
              </p>
              <p className="mt-2 font-display text-[1.5rem] leading-none text-foreground">
                {checkedInDays}/7
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/88">Your current rhythm</p>
            </div>
          </div>

          <section className="mt-4 rounded-[1.2rem] border border-border/68 bg-background/78 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                  Week map
                </p>
                <p className="mt-1 text-[13px] leading-[1.6] text-foreground/84">
                  See where you checked in across the last seven days.
                </p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/58" strokeWidth={1.8} />
            </div>
            <div className="mt-4">
              <WeekProgress week={week} />
            </div>
          </section>

          {(synthesis?.corePattern || synthesis?.summary) && (
            <section className="mt-4 rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/40">
                  <Sparkles className="h-3.5 w-3.5 text-foreground/74" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                    Weekly summary
                  </p>
                  {synthesis.corePattern && (
                    <p className="mt-2 max-w-[16ch] font-display text-[1.32rem] leading-[1.08] text-foreground">
                      {synthesis.corePattern}
                    </p>
                  )}
                  {synthesis.summary && (
                    <p className="mt-2.5 text-[13px] leading-[1.66] text-foreground/86">
                      {synthesis.summary}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {themes.length > 0 && (
            <section className="mt-4 rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/84">
                  <Waypoints className="h-3.5 w-3.5 text-foreground/74" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                    Recurring themes
                  </p>
                  <div className="mt-3 space-y-2">
                    {themes.map((theme) => (
                      <div
                        key={theme.label}
                        className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-border/60 bg-background/80 px-3 py-2.5"
                      >
                        <p className="font-display text-[1rem] leading-none text-foreground">
                          {theme.label}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/84">
                          {theme.count} {theme.count === 1 ? "reflection" : "reflections"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {momentCounts.length > 0 && (
            <section className="mt-4 rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                Recent tones
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {momentCounts.map(({ moment, count }) => (
                  <span
                    key={moment}
                    className="rounded-full border border-border/60 bg-background/84 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/76"
                  >
                    {MOMENT_LABELS[moment]} · {count}
                  </span>
                ))}
              </div>
            </section>
          )}

          {takeaways.length > 0 && (
            <section className="mt-4 rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                Recent takeaways
              </p>
              <div className="mt-3 space-y-2">
                {takeaways.map((takeaway) => (
                  <div
                    key={takeaway}
                    className="rounded-[0.95rem] border border-border/60 bg-background/82 px-3 py-2.5"
                  >
                    <p className="text-[13px] leading-[1.55] text-foreground/86">{takeaway}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}