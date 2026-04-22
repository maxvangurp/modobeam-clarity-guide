import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  dismissPreferencesNudge,
  getProfile,
  getStreak,
  isOnboardingComplete,
  shouldShowPreferencesNudge,
  type MomentNeed,
} from "@/lib/profile";
import { getDailyQuote, msUntilNextMidnight } from "@/lib/dailyQuote";
import {
  detectRecentThemes,
  dismissSuggestion,
  fetchRecentInsights,
  markSuggestionShown,
  pickSuggestion,
  shouldShowSuggestion,
  type InsightLite,
  type ThemeInsight,
} from "@/lib/progression";
import { inferReadingHint, type ReadingHint } from "@/lib/themeUnlocks";
import { getReadingType, type ReadingType } from "@/data/readingTypes";
import { READING_TYPES } from "@/data/readingTypes";
import { COMING_SOON_MODES } from "@/data/comingSoonModes";
import { ReadingPreviewCard } from "@/components/ReadingPreviewCard";
import { isReadingUnlocked, readingsRemainingToUnlock } from "@/lib/progression";
import { ArrowRight, Pause, Sparkles, Waypoints, X } from "lucide-react";
import { ThemeReflectionsSheet } from "@/components/ThemeReflectionsSheet";
import { WeekProgress } from "@/components/WeekProgress";
import { WeeklySynthesisCard } from "@/components/WeeklySynthesisCard";
import { WeeklyOverviewSheet } from "@/components/WeeklyOverviewSheet";
import { JustBeHere } from "@/components/JustBeHere";
import { buildWeek } from "@/lib/weekProgress";
import { getMomentTint, MOMENT_TINTS } from "@/lib/momentTint";
import {
  getCurrentWeekId,
  readCachedSynthesis,
  shouldOfferWeeklySynthesis,
  type WeeklySynthesis,
} from "@/lib/weeklySynthesis";
import { checkReturnAndStamp } from "@/lib/returnGap";
import { haptic } from "@/lib/haptics";
import { SunGlyphChip } from "@/components/SunGlyphChip";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { getInsightMoment } from "@/lib/insightMoment";

const MOMENT_ORDER: MomentNeed[] = [
  "clarity",
  "calm",
  "direction",
  "uncertain",
  "reflect",
];

const MOMENT_CHIP: Record<MomentNeed, string> = {
  clarity: "Clarity",
  calm: "Calm",
  direction: "Direction",
  uncertain: "Uncertainty",
  reflect: "Just reflecting",
};

const MOMENT_SURFACE: Record<MomentNeed, string> = {
  clarity: "bg-tone-clarity",
  calm: "bg-tone-calm",
  direction: "bg-tone-direction",
  uncertain: "bg-tone-uncertain",
  reflect: "bg-tone-reflect",
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const Index = () => {
  const navigate = useNavigate();
  const [showNudge, setShowNudge] = useState(false);
  const [insights, setInsights] = useState<InsightLite[]>([]);
  const [moment, setMoment] = useState<MomentNeed | null>(null);
  const [streak, setStreak] = useState<{ count: number; savedToday: boolean }>({
    count: 0,
    savedToday: false,
  });
  const [quote, setQuote] = useState(() => getDailyQuote());
  const [suggestion, setSuggestion] = useState<ReadingType | null>(null);
  const [themes, setThemes] = useState<ThemeInsight[]>([]);
  const [readingHint, setReadingHint] = useState<{
    hint: ReadingHint;
    reading: ReadingType;
  } | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [returnGap, setReturnGap] = useState<number | null>(null);
  const [weeklyOffer, setWeeklyOffer] = useState<
    { weekId: string; recent: InsightLite[] } | null
  >(null);
  const [weeklyOverviewOpen, setWeeklyOverviewOpen] = useState(false);
  const [weeklyDismissed, setWeeklyDismissed] = useState(false);
  const [breathing, setBreathing] = useState(false);

  // Refresh the quote at local midnight if the app stays open
  useEffect(() => {
    const t = setTimeout(() => setQuote(getDailyQuote()), msUntilNextMidnight());
    return () => clearTimeout(t);
  }, [quote]);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate("/welcome", { replace: true });
      return;
    }
    setShowNudge(shouldShowPreferencesNudge());
    setStreak(getStreak());

    // Detect a meaningful gap since last visit (≥ 3 days). Stamps the
    // visit timestamp so subsequent renders this session don't re-trigger.
    const gap = checkReturnAndStamp();
    if (gap.isReturning && gap.daysAway !== null) {
      setReturnGap(gap.daysAway);
    }

    (async () => {
      const recent = await fetchRecentInsights(14);
      setInsights(recent);

      // Pattern awareness — recurring themes across last week of reflections
      const detected = detectRecentThemes(recent);
      setThemes(detected);

      // Theme-driven reading hint — only when themes naturally point somewhere.
      const hint = inferReadingHint(detected);
      if (hint) {
        const reading = getReadingType(hint.type);
        const triedTypes = new Set(recent.map((r) => r.draw_type));
        // Only nudge toward something they haven't already tried.
        if (reading && !triedTypes.has(hint.type)) {
          setReadingHint({ hint, reading });
        }
      }

      // Weekly synthesis — fresh on weekend window OR cached any other day.
      const offer = shouldOfferWeeklySynthesis(recent);
      const cached = readCachedSynthesis();
      const sameWeekCached = cached?.weekId === offer.weekId ? cached : null;
      if (offer.offer || sameWeekCached) {
        setWeeklyOffer({ weekId: offer.weekId, recent: offer.recent });
      }

      // Suggestion — surface a reading they've just unlocked but haven't tried
      const sug = pickSuggestion(recent);
      if (sug && shouldShowSuggestion(sug)) {
        setSuggestion(sug);
        markSuggestionShown(sug.id);
      }
    })();
  }, [navigate]);

  const profile = getProfile();
  const last = insights[0] ?? null;
  const isReturning = !!last;
  const week = useMemo(() => buildWeek(insights), [insights]);
  const tint = getMomentTint(moment);
  const currentWeekId = useMemo(() => getCurrentWeekId(), []);
  const weekInsights = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return insights.filter((insight) => new Date(insight.created_at).getTime() >= cutoff);
  }, [insights]);
  const checkedInDays = useMemo(
    () => week.filter((day) => day.filled).length,
    [week],
  );
  const weeklyThemes = useMemo(
    () => detectRecentThemes(weekInsights, 7),
    [weekInsights],
  );
  const weeklySynthesis = useMemo<WeeklySynthesis | null>(() => {
    const cached = readCachedSynthesis();
    return cached?.weekId === currentWeekId ? cached : null;
  }, [currentWeekId, weeklyOffer]);
  const weeklyMomentCounts = useMemo(() => {
    const counts = new Map<MomentNeed, number>();
    for (const insight of weekInsights) {
      const savedMoment = getInsightMoment(insight.id);
      if (!savedMoment) continue;
      counts.set(savedMoment, (counts.get(savedMoment) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([moment, count]) => ({ moment, count }))
      .sort((a, b) => b.count - a.count);
  }, [weekInsights]);
  const weeklyTakeaways = useMemo(() => {
    return weekInsights
      .flatMap((insight) => insight.cards.map((card) => card.name))
      .filter((value, index, list) => list.indexOf(value) === index)
      .slice(0, 3);
  }, [weekInsights]);

  const greeting = useMemo(() => {
    const name = profile?.firstName;
    // Soft acknowledgment when returning after a meaningful gap.
    // No "you broke a streak" — the absence is part of the rhythm.
    if (returnGap !== null && returnGap >= 3) {
      if (returnGap >= 14) {
        return name
          ? `It's been a while, ${name}. Glad you're here.`
          : "It's been a while. Glad you're here.";
      }
      return name
        ? `Welcome back, ${name}. Some space was good.`
        : "Welcome back. Some space was good.";
    }
    if (name) {
      return isReturning ? `Welcome back, ${name}.` : `Hello, ${name}.`;
    }
    return isReturning ? "Welcome back." : "A quiet moment with yourself.";
  }, [profile?.firstName, isReturning, returnGap]);

  const lastCardTitle = last?.cards?.[0]?.name ?? null;
  const lastCardName = lastCardTitle?.toLowerCase();

  const startDaily = () => {
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    navigate(`/draw/daily${params.toString() ? `?${params}` : ""}`);
  };

  const startSuggestion = () => {
    if (!suggestion) return;
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    navigate(`/draw/${suggestion.id}${params.toString() ? `?${params}` : ""}`);
  };

  const openWeeklyOverview = () => {
    haptic("select");
    setWeeklyOverviewOpen(true);
  };

  return (
    <AppShell>
      {showNudge && (
        <section className="mt-2 mb-4 rounded-2xl bg-card/60 backdrop-blur border border-border/50 px-5 py-4 flex items-start gap-3 animate-fade-up">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-foreground/90 leading-relaxed">
              Has something changed in how you want to use Modobeam?
            </p>
            <Link
              to="/preferences"
              onClick={() => {
                dismissPreferencesNudge();
                setShowNudge(false);
              }}
              className="inline-block mt-1.5 text-[12px] uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-smooth"
            >
              Update preferences →
            </Link>
          </div>
          <button
            onClick={() => {
              dismissPreferencesNudge();
              setShowNudge(false);
            }}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground transition-smooth -mr-1 -mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* 1. Welcome + continuity */}
      <section className={cn(layout.pageSection, "pt-5 pb-2")}>
        <div className="space-y-7">
          <div className={cn("overflow-hidden rounded-[1.6rem] border border-border/80 bg-gradient-hero shadow-card", moment && MOMENT_SURFACE[moment])}>
            <div className="space-y-6 px-5 py-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[12.5px] font-medium tracking-[0.01em] text-foreground/74">
                    {greeting}
                  </p>
                  <SunGlyphChip />
                </div>
                <div className="space-y-3">
                  <p className={layout.eyebrow}>Daily clarity</p>
                  <h1 className={cn(layout.title, "max-w-[9.6ch]")}>
                    Take a breath.
                    <br />
                    <span className="font-medium italic text-foreground/84">Begin</span> when you're ready.
                  </h1>
                </div>
              </div>

              <div className="border-t border-border/55 pt-4">
                <div className="grid gap-2.5">
                  <button
                    type="button"
                    onClick={openWeeklyOverview}
                    className="group flex items-center justify-between gap-3 rounded-[1.18rem] border border-border/72 bg-background/90 px-3.5 py-3 text-left shadow-soft transition-smooth hover:border-border hover:bg-background"
                    aria-label="Open weekly overview"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/60">
                          This week
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                          {checkedInDays}/7 days
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <WeekProgress week={week} />
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground group-hover:translate-x-0.5"
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={openWeeklyOverview}
                    className="group flex items-center justify-between gap-3 rounded-[1.18rem] border border-border/72 bg-background/82 px-3.5 py-3 text-left transition-smooth hover:border-border hover:bg-background/94"
                    aria-label={`Open weekly overview: ${weekInsights.length} reflection ${weekInsights.length === 1 ? "" : "s"} this week`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/56">
                        Weekly total
                      </p>
                      <p className="mt-1 font-display text-[1.15rem] leading-[1.05] text-foreground">
                        {weekInsights.length} {weekInsights.length === 1 ? "reflection" : "reflections"} this week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                        {weeklyThemes[0]?.label ?? (streak.savedToday ? "Checked in today" : "Open overview")}
                      </p>
                      <ArrowRight
                        className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground group-hover:translate-x-0.5"
                        strokeWidth={1.8}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {(last && lastCardName) || themes.length > 0 ? (
              <div className="grid gap-3.5">
                {last && lastCardName && (
                  <section
                    className={cn(
                      "overflow-hidden rounded-[1.28rem] border border-border/76 shadow-soft",
                      moment ? MOMENT_SURFACE[moment] : "bg-card/96",
                    )}
                  >
                    <div className="space-y-4 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <p className={layout.sectionLabel}>Continuity</p>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/88">
                            {formatShortDate(last.created_at)}
                            <span className="mx-1.5 text-muted-foreground/45">·</span>
                            {getReadingType(last.draw_type)?.label ?? "Reflection"}
                          </p>
                        </div>
                        <Link
                          to={`/insight/${last.id}`}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-background/88 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/84 transition-smooth hover:border-border hover:bg-background"
                        >
                          Open
                          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </Link>
                      </div>

                      <div className="space-y-2.5 border-t border-border/55 pt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/56">
                          Last reflection
                        </p>
                        <p className="max-w-[14ch] font-display text-[1.56rem] leading-[1.02] text-foreground">
                          {lastCardTitle}
                        </p>
                        <p className="max-w-[31ch] text-[13px] leading-[1.65] text-foreground/84">
                          Pick up the thread you left there and return to what it was asking of you.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {themes.length > 0 && (
                  <section className="overflow-hidden rounded-[1.28rem] border border-border/76 bg-gradient-module shadow-soft">
                    <div className="space-y-4 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <p className={layout.sectionLabel}>Recent themes</p>
                          <p className="max-w-[29ch] text-[13px] leading-[1.62] text-foreground/84">
                            Recurring threads across your recent reflections.
                          </p>
                        </div>
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/86">
                          <Waypoints
                            className="h-4 w-4 text-foreground/76"
                            strokeWidth={1.8}
                          />
                        </span>
                      </div>

                      <div className="space-y-2 border-t border-border/55 pt-3.5">
                        {themes.map((t) => (
                          <button
                            key={t.label}
                            onClick={() => setActiveTheme(t.label)}
                            aria-label={`See reflections about ${t.label}`}
                            className="group flex w-full items-center justify-between gap-3 rounded-[1rem] border border-border/62 bg-background/78 px-3.5 py-3 text-left transition-smooth hover:border-border/84 hover:bg-background/94"
                          >
                            <div className="min-w-0">
                              <p className="font-display text-[1.08rem] leading-[1.05] text-foreground">
                                {t.label}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/86">
                                {t.count} {t.count === 1 ? "reflection" : "reflections"}
                              </p>
                            </div>
                            <ArrowRight
                              className="h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground"
                              strokeWidth={1.8}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            ) : null}

            {/* Weekly synthesis — once per week, only when there's enough material */}
            {weeklyOffer && !weeklyDismissed && (
              <WeeklySynthesisCard
                weekId={weeklyOffer.weekId}
                recent={weeklyOffer.recent}
                onDismiss={() => setWeeklyDismissed(true)}
              />
            )}

            {/* Theme-driven reading hint — surfaces when a recurring thread
                naturally points to a deeper reading they haven't opened yet. */}
            {readingHint && !hintDismissed && (
              <div className="animate-fade-up rounded-[1.25rem] border border-border/72 bg-card/94 px-4 py-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/46">
                    <readingHint.reading.icon
                      className="h-3.5 w-3.5 text-foreground/80"
                      strokeWidth={1.8}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={layout.sectionLabel}>Suggested next reading</p>
                    <p className="mt-2 text-[13px] leading-[1.65] text-foreground/92">
                      <span className="italic">"{readingHint.hint.matchedTheme}"</span> keeps surfacing. A{" "}
                      <span className="font-medium">{readingHint.reading.label.toLowerCase()}</span> reading might meet it.
                    </p>
                    <button
                      onClick={() => {
                        haptic("select");
                        const params = new URLSearchParams();
                        if (moment) params.set("moment", moment);
                        navigate(
                          `/draw/${readingHint.reading.id}${params.toString() ? `?${params}` : ""}`,
                        );
                      }}
                      className="mt-3 text-[11px] uppercase tracking-[0.2em] text-foreground/80 transition-smooth hover:text-foreground"
                    >
                      Try it →
                    </button>
                  </div>
                  <button
                    onClick={() => setHintDismissed(true)}
                    aria-label="Dismiss"
                    className="-mr-1 -mt-0.5 text-muted-foreground/60 transition-smooth hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ThemeReflectionsSheet
        open={activeTheme !== null}
        onOpenChange={(open) => !open && setActiveTheme(null)}
        theme={activeTheme}
        insights={insights}
      />

      <WeeklyOverviewSheet
        open={weeklyOverviewOpen}
        onOpenChange={setWeeklyOverviewOpen}
        week={week}
        reflectionCount={weekInsights.length}
        checkedInDays={checkedInDays}
        themes={weeklyThemes}
        momentCounts={weeklyMomentCounts}
        synthesis={weeklySynthesis}
        takeaways={weeklyTakeaways}
        surfaceClassName={moment ? MOMENT_SURFACE[moment] : undefined}
      />

      {/* Daily quote — quiet, rotates each day */}
      <section className={cn(layout.pageSection, "mb-10 [animation-delay:80ms]")}>
        <figure
          className={cn(
            "overflow-hidden rounded-[1.3rem] border border-border/76 shadow-soft",
            moment ? MOMENT_SURFACE[moment] : "bg-gradient-module",
          )}
        >
          <div className="space-y-4 px-4 py-4">
            <div className="flex items-end justify-between gap-3 border-b border-border/50 pb-3">
              <div className="space-y-1.5">
                <p className={layout.sectionLabel}>Today</p>
                <p className="text-[13px] leading-none text-muted-foreground/88">
                  A line to carry into the day.
                </p>
              </div>
              {moment && (
                <span className="rounded-full border border-border/68 bg-background/84 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/76">
                  {MOMENT_CHIP[moment]}
                </span>
              )}
            </div>

            <blockquote className="max-w-[22ch] font-display text-[1.42rem] leading-[1.28] text-foreground">
              {quote.text}
            </blockquote>

            {quote.author && (
              <figcaption className="border-t border-border/45 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/86">
                {quote.author}
              </figcaption>
            )}
          </div>
        </figure>
      </section>

      {/* 2. Moment check-in — precise tool, not a soft panel */}
      <section className={cn(layout.pageSection, "mb-12 [animation-delay:120ms]")}>
        <div className={cn("space-y-4 rounded-[1.25rem] border border-border/72 px-4 py-4 shadow-soft", moment ? MOMENT_SURFACE[moment] : "bg-card/90")}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <p className={layout.sectionLabel}>Set the tone</p>
              <p className="max-w-[27ch] text-[14px] font-medium leading-[1.45] text-foreground/90">
                What feels closest right now?
              </p>
            </div>
            <span className="shrink-0 pt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/84">
              Optional
            </span>
          </div>

          <div className={cn(layout.chipRow, "gap-2") }>
            {MOMENT_ORDER.map((id) => {
              const selected = moment === id;
              const t = MOMENT_TINTS[id];
              return (
                <button
                  key={id}
                  onClick={() => {
                    haptic("select");
                    setMoment(selected ? null : id);
                  }}
                  style={
                    selected
                      ? {
                          backgroundColor: `hsl(${t.bg})`,
                          borderColor: `hsl(${t.ring} / 0.5)`,
                          color: `hsl(${t.ring})`,
                          boxShadow: `0 0 0 3px hsl(${t.hsl} / 0.12)`,
                        }
                      : undefined
                  }
                    className={`min-h-10 rounded-full border px-3.5 py-2 text-[12px] transition-smooth ${
                    selected
                      ? "font-medium shadow-soft"
                        : "bg-background/88 text-foreground/88 border-border/70 hover:bg-card hover:text-foreground"
                  }`}
                >
                  {MOMENT_CHIP[id]}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border/45 pt-3">
            <p className="text-[11px] leading-none text-muted-foreground/92">
              Shapes this reading only.
            </p>
            <button
              onClick={() => {
                haptic("warm");
                setBreathing(true);
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/72 transition-smooth hover:text-foreground"
            >
              <Pause className="h-3 w-3" strokeWidth={1.6} />
              Just be here
            </button>
          </div>
        </div>
      </section>

      {/* 3. Primary action — one clear CTA */}
      <section className={cn(layout.pageSection, "mt-14 [animation-delay:240ms]")}>
        <Button
          size="lg"
          onClick={startDaily}
          style={
            tint
              ? { boxShadow: `0 0 0 1px hsl(${tint.hsl} / 0.25), 0 0 32px hsl(${tint.hsl} / 0.18)` }
              : undefined
          }
          className="group w-full h-auto min-h-[10rem] justify-between rounded-[1.3rem] bg-gradient-button px-5 py-6 text-primary-foreground shadow-cta transition-smooth hover:opacity-95"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display text-[1.12rem] font-semibold leading-tight">
                {isReturning ? "Continue your reflection" : "Start your daily clarity"}
              </span>
              <span className="mt-1.5 block text-[12px] font-body opacity-76">
                One card · one focus
              </span>
            </span>
          </span>
          <span className="text-xl opacity-60 group-hover:translate-x-0.5 transition-smooth">
            →
          </span>
        </Button>

      </section>

      <section className={cn(layout.pageSection, "mt-16 [animation-delay:300ms]")}>
        <ExploreCarousel
          totalReflections={insights.length}
          moment={moment}
        />
      </section>

      {/* Soft suggestion — only when something newly unlocked */}
      {suggestion && !suggestionDismissed && !readingHint && (
        <section className="mt-14 animate-fade-up [animation-delay:320ms]">
          <div className={cn("rounded-[1.3rem] border border-border/72 px-5 py-5 shadow-soft", moment ? MOMENT_SURFACE[moment] : "bg-card/94")}>
            <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/52">
              <suggestion.icon
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.8}
              />
            </span>
            <div className="flex-1 min-w-0">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-foreground/54">
                You might find this helpful
              </p>
              <p className="font-display text-[16px] font-semibold leading-tight text-foreground">
                {suggestion.label}
              </p>
              <p className="mt-1.5 max-w-[29ch] text-[12.5px] leading-[1.6] text-muted-foreground/90">
                {suggestion.description}
              </p>
              <button
                onClick={startSuggestion}
                className="mt-2.5 text-[12px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground transition-smooth"
              >
                Try it →
              </button>
            </div>
            <button
              onClick={() => {
                dismissSuggestion();
                setSuggestionDismissed(true);
              }}
              aria-label="Not now"
              className="text-muted-foreground/60 hover:text-foreground transition-smooth -mr-1 -mt-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            </div>
          </div>
        </section>
      )}

      <JustBeHere
        open={breathing}
        onClose={() => setBreathing(false)}
        closingLine={quote.text ? `"${quote.text}"` : undefined}
      />
    </AppShell>
  );
};

/**
 * Explore deeper readings — featured horizontal carousel.
 *
 * Shows 4 hand-picked previews directly under the primary CTA so the
 * second valid entry point (deeper modes) is visible without dominating
 * the screen. Real readings respect their unlock thresholds; coming-soon
 * modes appear as styled placeholders so users feel the depth that's
 * coming. A "See all" link routes to the Readings library.
 */
interface ExploreCarouselProps {
  totalReflections: number;
  moment: MomentNeed | null;
}

const FEATURED_REAL_IDS = ["three", "direction"] as const;
const FEATURED_COMING_IDS = ["ask-for-friend", "whats-going-on"] as const;

const ExploreCarousel = ({
  totalReflections,
  moment,
}: ExploreCarouselProps) => {
  const featuredReal = FEATURED_REAL_IDS.map((id) =>
    READING_TYPES.find((r) => r.id === id),
  ).filter(Boolean) as ReadingType[];

  const featuredComing = FEATURED_COMING_IDS.map((id) =>
    COMING_SOON_MODES.find((m) => m.id === id),
  ).filter(Boolean);

  const buildTo = (id: string) => {
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    return `/draw/${id}${params.toString() ? `?${params}` : ""}`;
  };

  const leadReading = featuredReal[0] ?? null;
  const railItems = [
    ...featuredReal.slice(1).map((reading) => ({ type: "real" as const, item: reading })),
    ...featuredComing.map((reading) => ({ type: "coming" as const, item: reading })),
  ];

  return (
    <section className="animate-fade-up [animation-delay:300ms]">
      <div className="rounded-[1.55rem] border border-border/78 bg-gradient-module px-5 py-5 shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-border/55 pb-4">
          <div className="space-y-2">
            <p className={layout.sectionLabel}>Explore</p>
            <h2 className="max-w-[11ch] font-display text-[1.9rem] font-semibold leading-[0.95] text-foreground">
              Go deeper,
              <br />
              with intention.
            </h2>
          </div>
          <Link
            to="/readings"
            className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/66 transition-smooth hover:text-foreground"
          >
            Library
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <p className="mt-4 max-w-[29ch] text-[13px] leading-[1.68] text-muted-foreground/96">
          Longer spreads when you want more context, friction, or emotional shape than the daily card can hold.
        </p>

        <div className="mt-5 space-y-3">
          {leadReading && (() => {
            const unlocked = isReadingUnlocked(leadReading.id, totalReflections);
            const remaining = readingsRemainingToUnlock(leadReading.id, totalReflections);

            return (
              <ReadingPreviewCard
                to={unlocked ? buildTo(leadReading.id) : undefined}
                label={leadReading.label}
                subtitle={leadReading.subtitle}
                cardCount={leadReading.cardCount}
                icon={leadReading.icon}
                category={leadReading.category}
                state={unlocked ? "ready" : "locked"}
                unlockIn={remaining}
                size="feature"
              />
            );
          })()}

          <div className="space-y-2.5 border-t border-border/50 pt-3">
            {railItems.map(({ type, item }) => {
              const unlocked = type === "real" ? isReadingUnlocked(item.id, totalReflections) : false;
              const remaining = type === "real" ? readingsRemainingToUnlock(item.id, totalReflections) : undefined;

              return (
                <ReadingPreviewCard
                  key={item.id}
                  to={type === "real" && unlocked ? buildTo(item.id) : undefined}
                  label={item.label}
                  subtitle={item.subtitle}
                  cardCount={item.cardCount}
                  icon={item.icon}
                  category={item.category}
                  state={type === "coming" ? "coming-soon" : unlocked ? "ready" : "locked"}
                  unlockIn={remaining}
                  size="compact"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;
