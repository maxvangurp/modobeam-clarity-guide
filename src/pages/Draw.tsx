import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReflectionCard } from "@/components/ReflectionCard";
import { MomentCheckIn } from "@/components/MomentCheckIn";
import { ReadingContextStep } from "@/components/ReadingContextStep";
import { Button } from "@/components/ui/button";
import { type OracleCard } from "@/data/deck";
import { getReadingType } from "@/data/readingTypes";
import {
  HORIZON_LABELS,
  HORIZON_TONES,
  MILESTONE_LABELS,
  RELATIONSHIP_STATUS_LABELS,
  describeContext,
  stashContext,
  type ReadingContext,
} from "@/lib/readingContext";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import {
  getProfile,
  GUIDANCE_LABELS,
  isAstroLensEnabled,
  LOOKING_FOR_LABELS,
  markMomentPromptShown,
  MOMENT_LABELS,
  shouldPromptMoment,
  USAGE_LABELS,
  type MomentNeed,
} from "@/lib/profile";
import { fetchRecentInsights, detectRecentThemes } from "@/lib/progression";
import { buildPriorThreads } from "@/lib/aiContinuity";
import { getDailyQuote } from "@/lib/dailyQuote";
import { recordMomentForStreak, shouldOfferRare, explainRareCard } from "@/lib/rareCard";
import { drawCards as drawDeck, drawDirectionCards, drawRelationshipCards } from "@/data/deck";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import {
  buildAstroContext,
  getCachedChart,
  inferFocusArea,
} from "@/lib/astrology";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Build the soft, AI-facing payload from the user's pre-draw context.
// Kept tiny and human — the edge function knows what to do with it.
function buildAiReadingContext(ctx: ReadingContext) {
  switch (ctx.kind) {
    case "friend":
      return {
        kind: "friend" as const,
        personName: ctx.personName,
        personRelation: ctx.personRelation,
        topic: ctx.topic ?? null,
      };
    case "this-or-that":
      return {
        kind: "this-or-that" as const,
        optionA: ctx.optionA,
        optionB: ctx.optionB,
        question: ctx.question ?? null,
      };
    case "horizon":
      return {
        kind: "horizon" as const,
        rangeKey: ctx.range,
        rangeLabel: HORIZON_LABELS[ctx.range],
        toneHint: HORIZON_TONES[ctx.range],
        area: ctx.area ?? null,
      };
    case "relationship-future":
      return {
        kind: "relationship-future" as const,
        personName: ctx.personName,
        personRelation: ctx.personRelation,
        statusKey: ctx.status,
        statusLabel: RELATIONSHIP_STATUS_LABELS[ctx.status],
      };
    case "milestone":
      return {
        kind: "milestone" as const,
        milestoneKey: ctx.milestone,
        milestoneLabel: MILESTONE_LABELS[ctx.milestone],
        note: ctx.note ?? null,
      };
  }
}


const Draw = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const intention = searchParams.get("q") ?? "";
  const fromOnboarding = searchParams.get("from") === "onboarding";
  // Moment can be preselected from the home screen via ?moment=…
  const presetMoment = searchParams.get("moment") as MomentNeed | null;
  const validMoment =
    presetMoment && presetMoment in MOMENT_LABELS ? presetMoment : null;
  const navigate = useNavigate();
  const profile = getProfile();

  const reading = getReadingType(type ?? "");

  const count = reading?.cardCount ?? 1;

  const [moment, setMoment] = useState<MomentNeed | null>(validMoment);
  // Auto-prompt the moment check-in only when the user's rhythm allows.
  const [showMoment, setShowMoment] = useState<boolean>(
    !fromOnboarding && !validMoment && shouldPromptMoment(profile?.rhythm),
  );

  // Pre-draw context (friend / horizon / this-or-that / etc.)
  const needsContext = !!reading?.needsContext;
  const [readingCtx, setReadingCtx] = useState<ReadingContext | null>(null);
  const [showContextStep, setShowContextStep] = useState<boolean>(needsContext);

  // Mark the prompt as shown the first time we surface it
  useEffect(() => {
    if (showMoment) markMomentPromptShown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track whether a rare card was woven into today's deal so we can mark
  // it seen on reveal and surface it with quiet reverence.
  const [rareCardId, setRareCardId] = useState<string | null>(null);
  const [rareReason, setRareReason] = useState<string | null>(null);
  const [rareThemes, setRareThemes] = useState<string[]>([]);
  const [contextReady, setContextReady] = useState(false);

  // Standard deal — may be quietly replaced by a rare card if conditions align.
  const cards = useMemo<OracleCard[]>(() => {
    if (type === "love" || type === "relationship-future")
      return drawRelationshipCards(count);
    if (type === "direction" || type === "horizon")
      return drawDirectionCards(count);
    return drawDeck(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, count, contextReady]);

  // Resolved deal (cards possibly with one swapped to a rare)
  const [resolvedCards, setResolvedCards] = useState<OracleCard[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const recent = await fetchRecentInsights(60);
      if (cancelled) return;
      const totalReflections = recent.length;

      // Compute days-away from the most recent saved insight (if any).
      let daysAway: number | null = null;
      if (recent[0]?.created_at) {
        const last = new Date(recent[0].created_at).getTime();
        daysAway = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
      }

      const { readMomentStreak } = await import("@/lib/rareCard");
      const momentStreak = readMomentStreak();

      const rare = shouldOfferRare({
        drawType: type ?? "",
        totalReflections,
        daysAway,
        momentStreak,
      });

      if (rare && type === "daily" && count === 1) {
        const themes = detectRecentThemes(recent, 7);
        const reason = explainRareCard({
          recentThemes: themes,
          daysAway,
          momentStreak,
          totalReflections,
        });
        setResolvedCards([rare]);
        setRareCardId(rare.id);
        setRareReason(reason);
        setRareThemes(themes.map((t) => t.label).filter(Boolean).slice(0, 3));
      } else {
        setResolvedCards(cards);
      }
      setContextReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, count]);

  const cardsToShow = resolvedCards ?? cards;

  const [revealed, setRevealed] = useState<boolean[]>(
    Array(count).fill(false),
  );
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(true);

  useEffect(() => {
    setShuffling(true);
    const t = setTimeout(() => setShuffling(false), 1400);
    return () => clearTimeout(t);
  }, [type]);

  // When a rare card is revealed, mark it seen so it goes into cooldown.
  useEffect(() => {
    if (!rareCardId) return;
    if (revealed[0]) {
      import("@/lib/rareCard").then((m) => m.markRareSeen(rareCardId));
    }
  }, [rareCardId, revealed]);

  const allRevealed = revealed.every(Boolean);

  const reveal = (i: number) => {
    setRevealed((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  // Reveal all — but staged, one card at a time, so the reading still
  // breathes even when the user taps "Reveal all".
  const revealAll = () => {
    haptic("flip");
    revealed.forEach((r, i) => {
      if (r) return;
      setTimeout(() => {
        reveal(i);
      }, i * 380);
    });
  };

  useEffect(() => {
    if (!reading) navigate("/");
  }, [reading, navigate]);

  if (!reading) return null;

  const labels = reading.positionLabels;

  if (showContextStep) {
    return (
      <AppShell showBack backTo="/readings" ambientMoment={moment} screenMood="draw">
        <div className="pt-2">
          <ReadingContextStep
            type={reading.id}
            onConfirm={(ctx) => {
              setReadingCtx(ctx);
              setShowContextStep(false);
            }}
          />
        </div>
      </AppShell>
    );
  }

  if (showMoment) {
    return (
      <AppShell showBack backTo="/" ambientMoment={moment} screenMood="draw">
        <div className="pt-4">
          <MomentCheckIn
            value={moment}
            onSelect={(m) => {
              setMoment(m);
              // small delay so the selection is felt before transition
              setTimeout(() => setShowMoment(false), 220);
            }}
            onSkip={() => setShowMoment(false)}
          />
        </div>
      </AppShell>
    );
  }

  const continueToInsight = async () => {
    setLoading(true);
    try {
      // Pull the user's recent threads so the AI can quietly notice when
      // today's reading echoes something they sat with before.
      const recent = await fetchRecentInsights(3);
      const priorThreads = buildPriorThreads(recent, 3);

      // Track moment streak (used by rare card)
      if (moment) recordMomentForStreak(moment);

      const dailyQuote = getDailyQuote();

      const { data, error } = await supabase.functions.invoke("reflect", {
        body: {
          intention,
          drawType: type,
          positionLabels: labels,
          cards: cardsToShow.map((c) => ({
            name: c.name,
            keyword: c.keyword,
            category: c.category,
            shortMeaning: c.shortMeaning,
            deeperMeaning: c.deeperMeaning,
          })),
          profile: profile
            ? {
                firstName: profile.firstName ?? null,
                usage: profile.usage ? USAGE_LABELS[profile.usage] : null,
                lookingFor: profile.lookingFor
                  ? LOOKING_FOR_LABELS[profile.lookingFor]
                  : null,
                guidance: profile.guidance
                  ? GUIDANCE_LABELS[profile.guidance]
                  : null,
                guidanceKey: profile.guidance ?? null,
              }
            : null,
          moment: moment
            ? {
                key: moment,
                label: MOMENT_LABELS[moment],
              }
            : null,
          priorThreads,
          dailyQuote,
          readingContext: readingCtx
            ? buildAiReadingContext(readingCtx)
            : null,
          astroContext: (() => {
            if (!isAstroLensEnabled(profile)) return null;
            if (!profile?.birthday) return null;
            const chart = getCachedChart({
              date: profile.birthday,
              time: profile.birthTime ?? null,
              lat: profile.birthLat ?? null,
              lon: profile.birthLon ?? null,
              tzOffsetMin: profile.birthTzOffsetMin ?? null,
            });
            const text = cardsToShow
              .map((c) => `${c.name} ${c.keyword} ${c.shortMeaning}`)
              .join(" ");
            const focus = inferFocusArea({
              text,
              cardCategories: cardsToShow.map((c) => c.category),
              chart,
            });
            return buildAstroContext(chart, focus);
          })(),
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const session_id = getSessionId();
      const combinedPayload = JSON.stringify({
        theme: (data as any).theme ?? "",
        tension: (data as any).tension ?? "",
        combined: (data as any).combined ?? "",
        focus: (data as any).focusArea ?? null,
      });
      const { data: inserted, error: insertErr } = await supabase
        .from("insights")
        .insert({
          session_id,
          intention: intention || null,
          draw_type: type!,
          cards: cardsToShow.map((c) => ({ id: c.id, name: c.name })),
          combined_insight: combinedPayload,
          ai_reflection: (data as any).reflection ?? "",
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      // Remember the moment for this insight so the next screen can tint itself
      if (moment && inserted?.id) {
        const { setInsightMoment } = await import("@/lib/insightMoment");
        setInsightMoment(inserted.id, moment);
      }
      // Persist reading context against this insight so Insight/Reading
      // screens can quote it back ("about Maya · close friend").
      if (readingCtx && inserted?.id) {
        stashContext(inserted.id, readingCtx);
      }
      navigate(`/reading/${inserted.id}`, { state: { back: "/" } });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Couldn't generate reflection. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Layout: 1 card = centered, 3 = row of 3, 4 = 2×2 grid, 5 = 3+2
  const gridClass =
    count === 1
      ? "flex justify-center"
      : count === 3
        ? "grid grid-cols-3 gap-2 justify-items-center"
        : count === 4
          ? "grid grid-cols-2 gap-3 justify-items-center max-w-[280px] mx-auto"
          : "grid grid-cols-3 gap-2 justify-items-center";
  const revealNoteClass =
    count >= 4
      ? "max-w-[8.25rem] px-2.5 py-2.5"
      : count === 3
        ? "max-w-[9.25rem] px-3 py-2.5"
        : "max-w-[18rem] px-4 py-3.5";

  return (
    <AppShell showBack backTo="/" ambientMoment={moment} screenMood={allRevealed ? "reveal" : "draw"}>
      {fromOnboarding && profile && !allRevealed && (
        <div className="mb-6 rounded-3xl bg-card/60 backdrop-blur border border-border/50 p-5 animate-fade-up">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Let's begin with a simple check-in
          </p>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            {profile.firstName ? `${profile.firstName}, take ` : "Take "}
            a breath. One card to settle into the moment
            {profile.lookingFor
              ? ` — a little ${LOOKING_FOR_LABELS[profile.lookingFor].toLowerCase()}`
              : ""}
            .
          </p>
        </div>
      )}
      {!fromOnboarding && moment && !allRevealed && (
        <div className="mb-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 px-5 py-3 flex items-center justify-between animate-fade-up">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              For this moment
            </p>
            <p className="text-[14px] text-foreground/90 truncate">
              {MOMENT_LABELS[moment]}
            </p>
          </div>
          <button
            onClick={() => setShowMoment(true)}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-smooth shrink-0 ml-3"
          >
            Change
          </button>
        </div>
      )}
      {!fromOnboarding && !moment && !allRevealed && (
        <div className="mb-6 flex justify-end animate-fade-up">
          <button
            onClick={() => setShowMoment(true)}
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-smooth"
          >
            Set a moment
          </button>
        </div>
      )}
      <div className="text-center pt-2 pb-8 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {reading.label}
        </p>
        <h1 className="font-display text-2xl font-light text-foreground">
          {shuffling
            ? "Settling…"
            : allRevealed
              ? "Sit with what you see."
              : "Tap each card when ready."}
        </h1>
        {intention && (
          <p className="mt-3 text-sm text-muted-foreground italic max-w-xs mx-auto">
            "{intention}"
          </p>
        )}
      </div>

      <div
        className={`${gridClass} animate-fade-up [animation-delay:120ms] transition-opacity duration-700`}
        style={{ opacity: shuffling ? 0.55 : 1 }}
      >
        {cardsToShow.map((card, i) => (
          <div
            key={card.id}
            className="flex flex-col items-center gap-2.5"
            style={{
              transform: shuffling
                ? `translateY(${(i % 2 === 0 ? -1 : 1) * 4}px) rotate(${(i - (count - 1) / 2) * 1.5}deg)`
                : "translateY(0) rotate(0deg)",
              transition: "transform 700ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <ReflectionCard
              card={card}
              index={i}
              size={count >= 4 ? "sm" : count === 3 ? "sm" : "lg"}
              revealed={revealed[i]}
              onReveal={() => reveal(i)}
            />
            {count > 1 && (
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-center max-w-[110px] leading-tight">
                {labels[i]}
              </span>
            )}
            {revealed[i] && (
              <div
                className={cn(
                  "w-full rounded-[1.15rem] border border-border/70 bg-card/92 text-center shadow-soft animate-fade-up",
                  revealNoteClass,
                )}
              >
                <p
                  className={cn(
                    "text-foreground/92",
                    count >= 4 ? "text-[11px] leading-[1.45]" : "text-[13px] leading-[1.55]",
                  )}
                >
                  {card.shortMeaning}
                </p>
                <p
                  className={cn(
                    "mt-2 uppercase tracking-[0.18em] text-muted-foreground",
                    count >= 4 ? "text-[9px]" : "text-[10px]",
                  )}
                >
                  {card.keyword}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiet recognition when a rare card has surfaced — only after reveal */}
      {rareCardId && allRevealed && (
        <div className="mt-6 text-center animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/80">
            ✦ A rare card today
          </p>
          <p className="text-[12px] text-muted-foreground mt-1.5 italic max-w-xs mx-auto leading-relaxed">
            Some cards only arrive at certain moments. Sit with this one.
          </p>
          {rareReason && (
            <div className="mt-4 max-w-xs mx-auto">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 mb-1.5">
                Why this card
              </p>
              <p className="text-[12px] text-foreground/80 leading-relaxed">
                {rareReason}
              </p>
              {rareThemes.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {rareThemes.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/90 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 animate-fade-up [animation-delay:300ms]">
        {!allRevealed ? (
          <Button
            variant="ghost"
            onClick={revealAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Reveal all
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={continueToInsight}
            disabled={loading}
            className="rounded-full bg-gradient-button text-primary-foreground px-8 shadow-cta min-w-[200px] hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reflecting...
              </>
            ) : (
              "See your insight"
            )}
          </Button>
        )}
      </div>
    </AppShell>
  );
};

export default Draw;
