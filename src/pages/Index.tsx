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
import { JustBeHere } from "@/components/JustBeHere";
import { buildWeek } from "@/lib/weekProgress";
import { getMomentTint, MOMENT_TINTS } from "@/lib/momentTint";
import {
  readCachedSynthesis,
  shouldOfferWeeklySynthesis,
} from "@/lib/weeklySynthesis";
import { checkReturnAndStamp } from "@/lib/returnGap";
import { haptic } from "@/lib/haptics";
import { SunGlyphChip } from "@/components/SunGlyphChip";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";

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

  const lastCardName = last?.cards?.[0]?.name?.toLowerCase();

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
      <section className={cn(layout.pageSection, "pt-4 pb-7")}>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm tracking-wide text-muted-foreground">
                {greeting}
              </p>
              <SunGlyphChip />
            </div>

            {(insights.length > 0 || streak.count > 0) && (
              <div className="flex flex-wrap items-center gap-2.5">
                {insights.length > 0 && <WeekProgress week={week} />}
                {streak.count > 0 && (
                  <div
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3.5 py-2 backdrop-blur"
                    title={
                      streak.savedToday
                        ? "You've reflected today"
                        : "Your gentle rhythm so far"
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        streak.savedToday
                          ? "bg-foreground/80 animate-gentle-breathe"
                          : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="text-[11px] tabular-nums text-foreground/80">
                      {streak.count} {streak.count === 1 ? "moment" : "moments"} of reflection
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weekly synthesis — once per week, only when there's enough material */}
          {weeklyOffer && !weeklyDismissed && (
            <WeeklySynthesisCard
              weekId={weeklyOffer.weekId}
              recent={weeklyOffer.recent}
              onDismiss={() => setWeeklyDismissed(true)}
            />
          )}

          <h1 className={layout.title}>
            Take a breath.
            <br />
            <span className="font-medium italic">Begin</span> when you're ready.
          </h1>

          {/* Continuity: link back to last reflection */}
          {last && lastCardName && (
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Last time you reflected on{" "}
              <span className="text-foreground/80 italic">{lastCardName}</span>
              {" — "}
              <Link
                to={`/insight/${last.id}`}
                className="underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground hover:decoration-foreground transition-smooth"
              >
                return to it
              </Link>
              .
            </p>
          )}

          {/* Pattern awareness — recurring themes across recent reflections */}
          {themes.length > 0 && (
            <div className="inline-flex items-start gap-2 rounded-2xl border border-border/40 bg-card/40 px-3.5 py-2.5 backdrop-blur">
              <Waypoints
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                strokeWidth={1.8}
              />
              <p className="text-[12px] leading-relaxed text-foreground/80">
                Lately you've been moving around{" "}
                {themes.map((t, i) => (
                  <span key={t.label}>
                    <button
                      onClick={() => setActiveTheme(t.label)}
                      className="italic text-foreground underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground transition-smooth"
                      aria-label={`See reflections about ${t.label}`}
                    >
                      {t.label}
                    </button>
                    {i < themes.length - 1 && (
                      <span className="text-muted-foreground"> and </span>
                    )}
                  </span>
                ))}
                .
              </p>
            </div>
          )}

          {/* Theme-driven reading hint — surfaces when a recurring thread
              naturally points to a deeper reading they haven't opened yet. */}
          {readingHint && !hintDismissed && (
            <div className="animate-fade-up rounded-2xl border border-border/50 bg-gradient-dawn px-4 py-3.5 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/40">
                  <readingHint.reading.icon
                    className="h-3.5 w-3.5 text-foreground/80"
                    strokeWidth={1.8}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-ink-soft/80">
                    Something in your reflections
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">
                    <span className="italic">"{readingHint.hint.matchedTheme}"</span>{" "}
                    keeps surfacing. A{" "}
                    <span className="font-medium">
                      {readingHint.reading.label.toLowerCase()}
                    </span>{" "}
                    reading might meet it.
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
                    className="mt-2 text-[11px] uppercase tracking-[0.2em] text-foreground/80 transition-smooth hover:text-foreground"
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
      </section>

      <ThemeReflectionsSheet
        open={activeTheme !== null}
        onOpenChange={(open) => !open && setActiveTheme(null)}
        theme={activeTheme}
        insights={insights}
      />

      {/* Daily quote — quiet, rotates each day */}
      <section className={cn(layout.pageSection, "[animation-delay:80ms]")}>
        <figure className="rounded-3xl bg-gradient-dawn border border-border/40 px-6 py-5 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink-soft/80 mb-2">
            Today
          </p>
          <blockquote className="font-display text-[16px] leading-snug text-foreground/95 italic">
            "{quote.text}"
          </blockquote>
          {quote.author && (
            <figcaption className="text-[12px] text-muted-foreground mt-2">
              — {quote.author}
            </figcaption>
          )}
        </figure>
      </section>

      {/* 2. Moment check-in — light, optional, inline */}
      <section className={cn(layout.pageSection, "space-y-3 [animation-delay:120ms]")}>
        <p className={layout.sectionLabel}>What feels closest right now?</p>
        <div className={cn(layout.chipRow, "gap-2.5")}>
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
                className={`min-h-11 px-4 py-2.5 rounded-full text-[13px] border transition-smooth backdrop-blur ${
                  selected
                    ? "font-medium"
                    : "bg-card/70 text-foreground/80 border-border/60 hover:bg-card hover:text-foreground"
                }`}
              >
                {MOMENT_CHIP[id]}
              </button>
            );
          })}
        </div>
        <div className={cn(layout.helperRow, "pt-0.5")}>
          <p className="text-[11px] text-muted-foreground/70">
            Optional — shapes this reading only.
          </p>
          {/* Soft escape hatch for hard days — no card, no ask, no streak penalty */}
          <button
            onClick={() => {
              haptic("warm");
              setBreathing(true);
            }}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/80 hover:text-foreground transition-smooth"
          >
            <Pause className="h-3 w-3" strokeWidth={1.6} />
            Just be here
          </button>
        </div>
      </section>

      {/* 3. Primary action — one clear CTA */}
      <section className={cn(layout.pageSection, "mt-9 space-y-7 [animation-delay:240ms]")}>
        <Button
          size="lg"
          onClick={startDaily}
          style={
            tint
              ? { boxShadow: `0 0 0 1px hsl(${tint.hsl} / 0.25), 0 0 32px hsl(${tint.hsl} / 0.18)` }
              : undefined
          }
          className="w-full h-auto min-h-[9.25rem] px-6 py-5 rounded-[1.75rem] bg-gradient-button text-primary-foreground hover:opacity-95 shadow-soft justify-between group transition-smooth"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display text-[1.05rem] font-medium leading-tight">
                {isReturning ? "Continue your reflection" : "Start your daily clarity"}
              </span>
              <span className="mt-1 block text-[12px] opacity-72 font-body">
                One card · one focus
              </span>
            </span>
          </span>
          <span className="text-xl opacity-60 group-hover:translate-x-0.5 transition-smooth">
            →
          </span>
        </Button>

        {/* 4. Explore deeper readings — featured carousel */}
        <ExploreCarousel
          totalReflections={insights.length}
          moment={moment}
        />
      </section>

      {/* Soft suggestion — only when something newly unlocked */}
      {suggestion && !suggestionDismissed && !readingHint && (
        <section className="mt-7 animate-fade-up [animation-delay:320ms]">
          <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/40 px-5 py-4 flex items-start gap-3">
            <span className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center shrink-0">
              <suggestion.icon
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.8}
              />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                You might find this helpful
              </p>
              <p className="text-[14px] font-display font-medium text-foreground leading-tight">
                {suggestion.label}
              </p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
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

  return (
    <div className="animate-fade-up space-y-4 [animation-delay:300ms]">
      <div className={layout.splitHeader}>
        <div className="space-y-1">
          <p className={layout.sectionLabel}>
            Or try a different way in
          </p>
          <p className="font-display text-[16px] font-medium text-foreground mt-0.5">
            Explore deeper readings
          </p>
        </div>
        <Link
          to="/readings"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-smooth shrink-0"
        >
          See all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Horizontal scroller — bleeds slightly into the page padding so the
          last card peeks, signalling there's more to scroll. */}
      <div className="-mx-5 px-5">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {featuredReal.map((r) => {
            const unlocked = isReadingUnlocked(r.id, totalReflections);
            const remaining = readingsRemainingToUnlock(r.id, totalReflections);
            return (
              <div key={r.id} className="snap-start">
                <ReadingPreviewCard
                  to={unlocked ? buildTo(r.id) : undefined}
                  label={r.label}
                  subtitle={r.subtitle}
                  cardCount={r.cardCount}
                  icon={r.icon}
                  category={r.category}
                  state={unlocked ? "ready" : "locked"}
                  unlockIn={remaining}
                  size="carousel"
                />
              </div>
            );
          })}
          {featuredComing.map((m) => (
            <div key={m.id} className="snap-start">
              <ReadingPreviewCard
                label={m.label}
                subtitle={m.subtitle}
                cardCount={m.cardCount}
                icon={m.icon}
                category={m.category}
                state="coming-soon"
                size="carousel"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
