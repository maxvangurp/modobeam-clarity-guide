import { ArrowRight, Compass, History, Sparkles, Waypoints } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WeekProgress } from "@/components/WeekProgress";
import { Button } from "@/components/ui/button";
import type { ThemeInsight } from "@/lib/progression";
import type { MomentNeed } from "@/lib/profile";
import { MOMENT_LABELS } from "@/lib/profile";
import type { DayCell } from "@/lib/weekProgress";
import type { WeeklySynthesis } from "@/lib/weeklySynthesis";
import { getWeeklySummaryText } from "@/lib/weeklyInsights";
import { cn } from "@/lib/utils";

interface WeeklyInsightsPanelProps {
  week: DayCell[];
  weekRangeLabel: string;
  reflectionCount: number;
  checkedInDays: number;
  themes: ThemeInsight[];
  momentCounts: Array<{ moment: MomentNeed; count: number }>;
  synthesis: WeeklySynthesis | null;
  takeaways: string[];
  repeatedFocusArea: string | null;
  surfaceClassName?: string;
  mode?: "sheet" | "page";
  onNavigate?: () => void;
}

export function WeeklyInsightsPanel({
  week,
  weekRangeLabel,
  reflectionCount,
  checkedInDays,
  themes,
  momentCounts,
  synthesis,
  takeaways,
  repeatedFocusArea,
  surfaceClassName,
  mode = "sheet",
  onNavigate,
}: WeeklyInsightsPanelProps) {
  const navigate = useNavigate();
  const leadingTone = momentCounts[0] ?? null;
  const summaryText = getWeeklySummaryText(synthesis?.summary, {
    reflectionCount,
    checkedInDays,
    themes,
    momentCounts,
  });

  const metricCards = [
    {
      label: "Reflections",
      value: String(reflectionCount),
      meta: "Saved this week",
    },
    {
      label: "Days checked in",
      value: `${checkedInDays}/7`,
      meta: "Your current rhythm",
    },
    {
      label: "Most used tone",
      value: leadingTone ? MOMENT_LABELS[leadingTone.moment] : "Still forming",
      meta: leadingTone ? `${leadingTone.count} ${leadingTone.count === 1 ? "reflection" : "reflections"}` : "No clear tone yet",
    },
    {
      label: "Focus area",
      value: repeatedFocusArea ?? "Still unfolding",
      meta: repeatedFocusArea ? "Returning most this week" : "No repeated thread yet",
    },
  ];

  const handleMonthlyOverview = () => {
    toast("Monthly overview is coming soon");
    onNavigate?.();
  };

  const handleNavigate = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  const blockClassName =
    mode === "sheet"
      ? "rounded-[1.2rem] border border-border/72 bg-card shadow-soft"
      : "rounded-[1.2rem] border border-border/68 bg-background/84";

  const itemClassName =
    mode === "sheet"
      ? "border border-border/62 bg-background"
      : "border border-border/60 bg-background/82";

  const eyebrowClassName =
    "text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/58";
  const bodyClassName = "text-[13px] font-normal leading-[1.62] text-foreground/84";
  const metaClassName = "text-[11px] font-medium leading-[1.45] text-muted-foreground/88";

  return (
    <div
      className={cn(
        "space-y-5 sm:space-y-4",
        mode === "page" ? "pb-6" : "mx-auto max-w-[920px] pb-2",
      )}
    >
      <section
        className={cn(
          "rounded-[1.24rem] border border-border/72 px-4 py-5 shadow-soft",
          mode === "sheet" ? "bg-card" : "bg-background/84",
          mode === "page" ? surfaceClassName : undefined,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/40">
            <Sparkles className="h-3.5 w-3.5 text-foreground/74" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={eyebrowClassName}>
                  Weekly summary
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/84">
                  {weekRangeLabel}
                </p>
              </div>
              {synthesis?.corePattern && (
                <p className="max-w-[13ch] text-right font-display text-[1rem] font-medium leading-[1.08] text-foreground/84">
                  {synthesis.corePattern}
                </p>
              )}
            </div>
            <p className="mt-3 text-[13.5px] font-normal leading-[1.7] text-foreground/88">{summaryText}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={cn("rounded-[1.15rem] px-3.5 py-4", itemClassName)}
          >
            <p className={eyebrowClassName}>
              {card.label}
            </p>
            <p className="mt-2 font-display text-[1.3rem] font-medium leading-[1.08] text-foreground">
              {card.value}
            </p>
            <p className={cn("mt-1", metaClassName)}>{card.meta}</p>
          </div>
        ))}
      </section>

      <section className={cn(blockClassName, "px-4 py-5")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={eyebrowClassName}>
              Week map
            </p>
            <p className={cn("mt-1", bodyClassName)}>
              See where you checked in across the last seven days.
            </p>
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/58" strokeWidth={1.8} />
        </div>
        <div className="mt-4">
          <WeekProgress week={week} />
        </div>
      </section>

      {themes.length > 0 && (
        <section className={cn(blockClassName, "px-4 py-5")}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/84">
              <Waypoints className="h-3.5 w-3.5 text-foreground/74" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={eyebrowClassName}>
                Returning themes
              </p>
              <div className="mt-3.5 space-y-2.5">
                {themes.map((theme) => (
                  <div
                    key={theme.label}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-[0.95rem] px-3 py-3",
                      itemClassName,
                    )}
                  >
                    <p className="font-display text-[1rem] font-medium leading-[1.12] text-foreground">
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
        <section className={cn(blockClassName, "px-4 py-5")}>
          <p className={eyebrowClassName}>
            Recent tones
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {momentCounts.map(({ moment, count }) => (
              <span
                key={moment}
                className={cn(
                  "rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/76",
                  itemClassName,
                )}
              >
                {MOMENT_LABELS[moment]} · {count}
              </span>
            ))}
          </div>
        </section>
      )}

      {takeaways.length > 0 && (
        <section className={cn(blockClassName, "px-4 py-5")}>
          <p className={eyebrowClassName}>
            Recent takeaways
          </p>
          <div className="mt-3.5 space-y-2.5">
            {takeaways.map((takeaway) => (
              <div key={takeaway} className={cn("rounded-[0.95rem] px-3 py-3", itemClassName)}>
                <p className={bodyClassName}>{takeaway}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={cn(blockClassName, "px-4 py-5")}>
        <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-3">
          <div>
            <p className={eyebrowClassName}>
              Next steps
            </p>
            <p className={cn("mt-1", bodyClassName)}>
              Keep this week connected to the rest of your reflection history.
            </p>
          </div>
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/58" strokeWidth={1.8} />
        </div>

        <div className="mt-3.5 grid gap-2.5">
          <button
            type="button"
            onClick={() => handleNavigate("/history")}
            className={cn(
              "group flex w-full items-center justify-between rounded-[0.95rem] px-3.5 py-3 text-left transition-smooth hover:bg-background/94",
              itemClassName,
            )}
          >
            <div>
              <p className={eyebrowClassName}>
                View all reflections
              </p>
              <p className={cn("mt-1", bodyClassName)}>
                Open your full reflection history and longer patterns.
              </p>
            </div>
            <History className="h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={handleMonthlyOverview}
            className={cn(
              "group flex w-full items-center justify-between rounded-[0.95rem] px-3.5 py-3 text-left transition-smooth hover:bg-background/94",
              itemClassName,
            )}
          >
            <div>
              <p className={eyebrowClassName}>
                Monthly overview
              </p>
              <p className={cn("mt-1", bodyClassName)}>
                Step back further once you want a wider pattern view.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground" strokeWidth={1.8} />
          </button>

          <Button
            type="button"
            onClick={() => handleNavigate("/")}
            className="mt-1 h-12 rounded-[0.95rem] bg-gradient-button text-primary-foreground shadow-soft"
          >
            Continue reflection
          </Button>

          {mode === "page" && (
            <Link
              to="/preferences"
              onClick={onNavigate}
              className={cn(
                "inline-flex items-center justify-between rounded-[0.95rem] px-3.5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/72 transition-smooth hover:bg-background/94",
                itemClassName,
              )}
            >
              Reflection preferences
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}