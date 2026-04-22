import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WeeklyInsightsPanel } from "@/components/WeeklyInsightsPanel";
import { buildWeek } from "@/lib/weekProgress";
import { fetchRecentInsights, type InsightLite } from "@/lib/progression";
import { getCurrentWeekId, readCachedSynthesis, type WeeklySynthesis } from "@/lib/weeklySynthesis";
import { buildWeeklyInsights } from "@/lib/weeklyInsights";
import { getProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { layout } from "@/lib/layout";

const WeeklyInsights = () => {
  const [insights, setInsights] = useState<InsightLite[]>([]);
  const currentWeekId = useMemo(() => getCurrentWeekId(), []);
  const profile = getProfile();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const recent = await fetchRecentInsights(30);
      if (!cancelled) setInsights(recent);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const week = useMemo(() => buildWeek(insights), [insights]);
  const weekly = useMemo(() => buildWeeklyInsights(insights, week), [insights, week]);
  const synthesis = useMemo<WeeklySynthesis | null>(() => {
    const cached = readCachedSynthesis();
    return cached?.weekId === currentWeekId ? cached : null;
  }, [currentWeekId, insights.length]);

  return (
    <AppShell showBack backTo="/preferences" showNav={false}>
      <section className={cn(layout.pageHeader, layout.pageSection)}>
        <div className={layout.pageIntro}>
          <p className={layout.eyebrow}>Reflection insights</p>
          <h1 className={layout.title}>This week, held more clearly.</h1>
          <p className={layout.body}>
            A weekly snapshot of how you&apos;ve been returning, what&apos;s repeating, and what Modobeam is noticing across the week.
          </p>
          {profile?.firstName && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/82">
              {profile.firstName}&rsquo;s weekly view · {weekly.weekRangeLabel}
            </p>
          )}
        </div>
      </section>

      <WeeklyInsightsPanel
        mode="page"
        week={week}
        weekRangeLabel={weekly.weekRangeLabel}
        reflectionCount={weekly.reflectionCount}
        checkedInDays={weekly.checkedInDays}
        themes={weekly.themes}
        momentCounts={weekly.momentCounts}
        synthesis={synthesis}
        takeaways={weekly.takeaways}
        repeatedFocusArea={weekly.repeatedFocusArea}
      />
    </AppShell>
  );
};

export default WeeklyInsights;