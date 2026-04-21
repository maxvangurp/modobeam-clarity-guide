import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReflectionCard } from "@/components/ReflectionCard";
import { MomentCheckIn } from "@/components/MomentCheckIn";
import { Button } from "@/components/ui/button";
import { drawCards, type OracleCard } from "@/data/deck";
import { getReadingType, type DrawType } from "@/data/readingTypes";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import {
  getProfile,
  GUIDANCE_LABELS,
  LOOKING_FOR_LABELS,
  markMomentPromptShown,
  MOMENT_LABELS,
  shouldPromptMoment,
  USAGE_LABELS,
  type MomentNeed,
} from "@/lib/profile";
import { fetchRecentInsights } from "@/lib/progression";
import { buildPriorThreads } from "@/lib/aiContinuity";
import { getDailyQuote } from "@/lib/dailyQuote";
import { recordMomentForStreak, shouldOfferRare, markRareSeen } from "@/lib/rareCard";
import { drawCards as drawDeck } from "@/data/deck";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  // Standard deal — may be quietly replaced by a rare card if conditions align.
  const cards = useMemo<OracleCard[]>(
    () => drawDeck(count),
    [type, count],
  );

  const [moment, setMoment] = useState<MomentNeed | null>(validMoment);
  // Auto-prompt the moment check-in only when the user's rhythm allows.
  // - Skip right after onboarding (already a fresh setup moment).
  // - Skip when a moment was already chosen on the home screen.
  // - Skip when the user explicitly chose "whenever I need it" — they can
  //   still open it manually from the chip below.
  const [showMoment, setShowMoment] = useState<boolean>(
    !fromOnboarding && !validMoment && shouldPromptMoment(profile?.rhythm),
  );

  // Mark the prompt as shown the first time we surface it, so the
  // rhythm-based cooldown starts ticking.
  useEffect(() => {
    if (showMoment) markMomentPromptShown();
    // We only want to mark it on the initial auto-show, not on manual reopens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [revealed, setRevealed] = useState<boolean[]>(
    Array(count).fill(false),
  );
  const [loading, setLoading] = useState(false);
  // Brief shuffle beat before the cards become tappable.
  // Adds anticipation; turns the reveal into an event, not a mechanic.
  const [shuffling, setShuffling] = useState(true);

  useEffect(() => {
    setShuffling(true);
    const t = setTimeout(() => setShuffling(false), 1400);
    return () => clearTimeout(t);
  }, [type]);

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

  if (showMoment) {
    return (
      <AppShell showBack backTo="/" ambientMoment={moment}>
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
          cards: cards.map((c) => ({
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
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const session_id = getSessionId();
      const combinedPayload = JSON.stringify({
        theme: (data as any).theme ?? "",
        tension: (data as any).tension ?? "",
        combined: (data as any).combined ?? "",
      });
      const { data: inserted, error: insertErr } = await supabase
        .from("insights")
        .insert({
          session_id,
          intention: intention || null,
          draw_type: type!,
          cards: cards.map((c) => ({ id: c.id, name: c.name })),
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
      navigate(`/insight/${inserted.id}`);
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

  return (
    <AppShell showBack backTo="/" ambientMoment={moment}>
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
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="flex flex-col items-center gap-2"
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
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center max-w-[90px] leading-tight">
                {labels[i]}
              </span>
            )}
          </div>
        ))}
      </div>

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
            className="rounded-full bg-gradient-button text-primary-foreground px-8 shadow-soft min-w-[200px]"
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
