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

  return (
    <div
      className={cn(
        "space-y-4",
        mode === "page" ? "pb-6" : "mx-auto max-w-[920px] pb-2",
      )}
    >
      <section
        className={cn(
          "rounded-[1.24rem] border border-border/68 bg-background/84 px-4 py-4",
          surfaceClassName,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/40">
            <Sparkles className="h-3.5 w-3.5 text-foreground/74" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                  Weekly summary
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/84">
                  {weekRangeLabel}
                </p>
              </div>
              {synthesis?.corePattern && (
                <p className="max-w-[13ch] text-right font-display text-[1rem] leading-[1.02] text-foreground/84">
                  {synthesis.corePattern}
                </p>
              )}
            </div>
            <p className="mt-3 text-[14px] leading-[1.68] text-foreground/88">{summaryText}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.15rem] border border-border/65 bg-background/82 px-3.5 py-3.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/56">
              {card.label}
            </p>
            <p className="mt-2 font-display text-[1.3rem] leading-[1.04] text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-[11px] leading-[1.4] text-muted-foreground/88">{card.meta}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[1.2rem] border border-border/68 bg-background/78 px-4 py-4">
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

      {themes.length > 0 && (
        <section className="rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/84">
              <Waypoints className="h-3.5 w-3.5 text-foreground/74" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
                Returning themes
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
        <section className="rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
            Recent tones
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {momentCounts.map(({ moment, count }) => (
              <span
                key={moment}
                className="rounded-full border border-border/60 bg-background/84 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/76"
              >
                {MOMENT_LABELS[moment]} · {count}
              </span>
            ))}
          </div>
        </section>
      )}

      {takeaways.length > 0 && (
        <section className="rounded-[1.2rem] border border-border/68 bg-background/80 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
            Recent takeaways
          </p>
          <div className="mt-3 space-y-2">
            {takeaways.map((takeaway) => (
              <div key={takeaway} className="rounded-[0.95rem] border border-border/60 bg-background/82 px-3 py-3">
                <p className="text-[13px] leading-[1.55] text-foreground/86">{takeaway}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[1.2rem] border border-border/68 bg-background/84 px-4 py-4">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/58">
              Next steps
            </p>
            <p className="mt-1 text-[13px] leading-[1.6] text-foreground/84">
              Keep this week connected to the rest of your reflection history.
            </p>
          </div>
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/58" strokeWidth={1.8} />
        </div>

        <div className="mt-3 grid gap-2.5">
          <button
            type="button"
            onClick={() => handleNavigate("/history")}
            className="group flex w-full items-center justify-between rounded-[0.95rem] border border-border/60 bg-background/82 px-3.5 py-3 text-left transition-smooth hover:bg-background/94"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/58">
                View all reflections
              </p>
              <p className="mt-1 text-[13px] leading-[1.5] text-foreground/84">
                Open your full reflection history and longer patterns.
              </p>
            </div>
            <History className="h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={handleMonthlyOverview}
            className="group flex w-full items-center justify-between rounded-[0.95rem] border border-border/60 bg-background/82 px-3.5 py-3 text-left transition-smooth hover:bg-background/94"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/58">
                Monthly overview
              </p>
              <p className="mt-1 text-[13px] leading-[1.5] text-foreground/84">
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
              className="inline-flex items-center justify-between rounded-[0.95rem] border border-border/60 bg-background/82 px-3.5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/72 transition-smooth hover:bg-background/94"
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