import { getInsightMoment } from "@/lib/insightMoment";
import type { MomentNeed } from "@/lib/profile";
import { detectRecentThemes, type InsightLite, type ThemeInsight } from "@/lib/progression";
import type { DayCell } from "@/lib/weekProgress";

export interface WeeklyMomentCount {
  moment: MomentNeed;
  count: number;
}

export interface WeeklyInsightsModel {
  weekInsights: InsightLite[];
  reflectionCount: number;
  checkedInDays: number;
  themes: ThemeInsight[];
  momentCounts: WeeklyMomentCount[];
  takeaways: string[];
  weekRangeLabel: string;
  repeatedFocusArea: string | null;
}

function formatRangeDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getWeekRangeLabel(week: DayCell[]): string {
  if (!week.length) return "This week";
  const start = new Date(`${week[0].key}T00:00:00`);
  const end = new Date(`${week[week.length - 1].key}T00:00:00`);

  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString(undefined, { month: "short" })} ${start.getDate()}–${end.getDate()}`;
  }

  return `${formatRangeDate(start)}–${formatRangeDate(end)}`;
}

export function buildWeeklyInsights(
  insights: InsightLite[],
  week: DayCell[],
): WeeklyInsightsModel {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekInsights = insights.filter(
    (insight) => new Date(insight.created_at).getTime() >= cutoff,
  );

  const checkedInDays = week.filter((day) => day.filled).length;
  const themes = detectRecentThemes(weekInsights, 7);

  const counts = new Map<MomentNeed, number>();
  for (const insight of weekInsights) {
    const savedMoment = getInsightMoment(insight.id);
    if (!savedMoment) continue;
    counts.set(savedMoment, (counts.get(savedMoment) ?? 0) + 1);
  }

  const momentCounts = [...counts.entries()]
    .map(([moment, count]) => ({ moment, count }))
    .sort((a, b) => b.count - a.count);

  const takeaways = weekInsights
    .flatMap((insight) => insight.cards.map((card) => card.name))
    .filter((value, index, list) => list.indexOf(value) === index)
    .slice(0, 3);

  return {
    weekInsights,
    reflectionCount: weekInsights.length,
    checkedInDays,
    themes,
    momentCounts,
    takeaways,
    weekRangeLabel: getWeekRangeLabel(week),
    repeatedFocusArea: themes[0]?.label ?? null,
  };
}