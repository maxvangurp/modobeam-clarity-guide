// Modobeam — soft weekly progress strip
// Seven small dots, oldest → today. Filled = saved reflection that day.
// Today is gently ringed. No counts, no judgment.

import type { DayCell } from "@/lib/weekProgress";

interface Props {
  week: DayCell[];
}

export function WeekProgress({ week }: Props) {
  const filledCount = week.filter((d) => d.filled).length;
  return (
    <div
      className="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-border/40 bg-card/40 px-3.5 py-1.5 backdrop-blur"
      aria-label={`This week: ${filledCount} of 7 days reflected on`}
    >
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
        This week
      </span>
      <div className="flex items-center gap-1.5">
        {week.map((d) => (
          <span
            key={d.key}
            title={d.label}
            className={[
              "h-1.5 w-1.5 rounded-full transition-smooth",
              d.filled
                ? "bg-foreground/70"
                : "bg-foreground/15",
              d.isToday
                ? "ring-2 ring-offset-1 ring-offset-background ring-foreground/30 scale-125"
                : "",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
