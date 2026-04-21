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
import { getReadingType, type ReadingType } from "@/data/readingTypes";
import { Flame, Layers, Sparkles, Waypoints, X } from "lucide-react";
import { ThemeReflectionsSheet } from "@/components/ThemeReflectionsSheet";
import { WeekProgress } from "@/components/WeekProgress";
import { buildWeek } from "@/lib/weekProgress";
import { getMomentTint, MOMENT_TINTS } from "@/lib/momentTint";

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
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

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

    (async () => {
      const recent = await fetchRecentInsights(14);
      setInsights(recent);

      // Pattern awareness — recurring themes across last week of reflections
      setThemes(detectRecentThemes(recent));

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

  const greeting = useMemo(() => {
    if (profile?.firstName) {
      return isReturning
        ? `Welcome back, ${profile.firstName}.`
        : `Hello, ${profile.firstName}.`;
    }
    return isReturning ? "Welcome back." : "A quiet moment with yourself.";
  }, [profile?.firstName, isReturning]);

  const lastCardName = last?.cards?.[0]?.name?.toLowerCase();
  const lastReading = last ? getReadingType(last.draw_type) : null;

  const startDaily = () => {
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    navigate(`/draw/daily${params.toString() ? `?${params}` : ""}`);
  };

  const startThree = () => {
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    navigate(`/draw/three${params.toString() ? `?${params}` : ""}`);
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
      <section className="pt-6 pb-8 animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground tracking-wide">
            {greeting}
          </p>
          {streak.count > 0 && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full bg-card/60 backdrop-blur border border-border/50 px-2.5 py-1"
              title={
                streak.savedToday
                  ? "You've reflected today"
                  : "Your gentle rhythm so far"
              }
            >
              <Flame
                className={`h-3 w-3 ${
                  streak.savedToday ? "text-beam" : "text-muted-foreground/60"
                }`}
                strokeWidth={1.8}
              />
              <span className="text-[11px] tabular-nums text-foreground/80">
                {streak.count} {streak.count === 1 ? "day" : "days"}
              </span>
            </div>
          )}
        </div>
        <h1 className="font-display text-[2rem] leading-[1.1] font-light tracking-tight text-foreground mt-2">
          Take a breath.
          <br />
          <span className="font-medium italic">Begin</span> when you're ready.
        </h1>

        {/* Continuity: link back to last reflection */}
        {last && lastCardName && (
          <p className="text-[13px] text-muted-foreground mt-4 leading-relaxed">
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
          <div className="mt-4 inline-flex items-start gap-2 rounded-2xl bg-card/40 backdrop-blur border border-border/40 px-3.5 py-2.5">
            <Waypoints
              className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5 shrink-0"
              strokeWidth={1.8}
            />
            <p className="text-[12px] text-foreground/80 leading-relaxed">
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
      </section>

      <ThemeReflectionsSheet
        open={activeTheme !== null}
        onOpenChange={(open) => !open && setActiveTheme(null)}
        theme={activeTheme}
        insights={insights}
      />

      {/* Daily quote — quiet, rotates each day */}
      <section className="mb-8 animate-fade-up [animation-delay:80ms]">
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
      <section className="animate-fade-up [animation-delay:120ms]">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          What feels closest right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {MOMENT_ORDER.map((id) => {
            const selected = moment === id;
            return (
              <button
                key={id}
                onClick={() => setMoment(selected ? null : id)}
                className={`px-4 py-2 rounded-full text-[13px] border transition-smooth backdrop-blur ${
                  selected
                    ? "bg-foreground text-background border-foreground shadow-soft"
                    : "bg-card/70 text-foreground/80 border-border/60 hover:bg-card hover:text-foreground"
                }`}
              >
                {MOMENT_CHIP[id]}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-2">
          Optional — shapes this reading only.
        </p>
      </section>

      {/* 3. Primary action — one clear CTA */}
      <section className="mt-10 animate-fade-up [animation-delay:240ms]">
        <Button
          size="lg"
          onClick={startDaily}
          className="w-full h-auto py-5 px-6 rounded-2xl bg-gradient-button text-primary-foreground hover:opacity-95 shadow-soft justify-between group"
        >
          <span className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display text-base font-medium">
                {isReturning ? "Continue your reflection" : "Start your daily clarity"}
              </span>
              <span className="block text-xs opacity-70 font-body">
                One card · one focus
              </span>
            </span>
          </span>
          <span className="text-xl opacity-60 group-hover:translate-x-0.5 transition-smooth">
            →
          </span>
        </Button>

        {/* 4. Secondary subtle actions */}
        <div className="mt-5 flex items-center justify-center gap-1 text-[13px]">
          <button
            onClick={startThree}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-smooth px-3 py-2 rounded-full"
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.6} />
            3-card insight
          </button>
          <span className="text-muted-foreground/30">·</span>
          <Link
            to="/history"
            className="text-muted-foreground hover:text-foreground transition-smooth px-3 py-2 rounded-full"
          >
            View your week
          </Link>
        </div>
      </section>

      {/* Soft suggestion — only when something newly unlocked */}
      {suggestion && !suggestionDismissed && (
        <section className="mt-8 animate-fade-up [animation-delay:320ms]">
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

      {/* Quiet link to deeper readings — never competing with the primary CTA */}
      <section className="mt-10 text-center animate-fade-up [animation-delay:360ms]">
        <Link
          to="/readings"
          className="inline-block text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 hover:text-foreground transition-smooth"
        >
          Explore deeper readings
        </Link>
      </section>
    </AppShell>
  );
};

export default Index;
