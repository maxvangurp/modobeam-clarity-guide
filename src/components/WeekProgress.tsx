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
      className="inline-flex min-h-10 items-center gap-3 rounded-full border border-border/70 bg-background/90 px-3.5 py-2 shadow-soft"
      aria-label={`This week: ${filledCount} of 7 days reflected on`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/56">
        This week
      </span>
      <div className="flex items-center gap-1.5 pt-px">
        {week.map((d) => (
          <span
            key={d.key}
            title={d.label}
            className={[
              "h-1.5 w-1.5 rounded-full transition-smooth",
              d.filled
                ? "bg-foreground/82"
                : "bg-foreground/20",
              d.isToday
                ? "ring-2 ring-offset-[3px] ring-offset-background ring-foreground/28 scale-[1.35]"
                : "",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
