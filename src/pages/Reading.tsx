// Modobeam — progressive reveal reading flow
//
// /reading/:id loads a saved insight and unfolds it one layer at a time.
// Each step locks the next: the user advances by tapping Continue or
// swiping up. Swiping down goes back. The final step links into the
// classic /insight/:id full view, which holds journaling + history.
//
// Step shape:
//   1-card readings → back · front · underneath · prompt · closing
//   3+card readings → back · per-card front · connection · prompt · closing
//
// We only run this flow on the first viewing of a fresh reading. Repeat
// visits route directly to /insight/:id (handled by Draw + history links).

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { type InsightRow, type Combined, parseCombined } from "@/lib/insightTypes";
import { describeContext, readContext } from "@/lib/readingContext";
import { ReflectionCard } from "@/components/ReflectionCard";
import { LifeAreaGlyph } from "@/components/LifeAreaGlyph";
import { FocusChip } from "@/components/FocusChip";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getCardById, type OracleCard } from "@/data/deck";
import { getReadingType } from "@/data/readingTypes";
import { getInsightMoment } from "@/lib/insightMoment";
import { getMomentTint } from "@/lib/momentTint";
import { MOMENT_LABELS, type MomentNeed } from "@/lib/profile";
import { haptic } from "@/lib/haptics";
import { useVerticalSwipe } from "@/hooks/useVerticalSwipe";
import {
  inferLifeAreaFromText,
  lifeAreaForFocusKey,
  type LifeAreaCard as LifeAreaCardType,
} from "@/data/lifeAreas";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  ChevronUp,
} from "lucide-react";

type StepKind =
  | "intro"
  | "card"
  | "underneath"
  | "prompt"
  | "closing";

interface Step {
  kind: StepKind;
  /** Card index when kind === "card". */
  cardIndex?: number;
}

const Reading = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const backTo = useBackNavigation("/");
  const [insight, setInsight] = useState<InsightRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);

  // Pull the saved reading.
  useEffect(() => {
    (async () => {
      if (!id) return;
      
      // If user is revisiting, skip the flow and go straight to full view
      if (searchParams.get("skip") === "true") {
        navigate(`/insight/${id}`, { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Reading not found");
        navigate("/");
        return;
      }
      setInsight(data as unknown as InsightRow);
      setLoading(false);
    })();
  }, [id, navigate, searchParams]);

  const combined = useMemo<Combined>(
    () => parseCombined(insight?.combined_insight),
    [insight],
  );

  const cards = useMemo<OracleCard[]>(() => {
    if (!insight) return [];
    return insight.cards
      .map((c) => getCardById(c.id))
      .filter(Boolean) as OracleCard[];
  }, [insight]);

  const reading = insight ? getReadingType(insight.draw_type) : null;
  const labels = reading?.positionLabels ?? ["Today"];

  // Derive a Life Area for the closing step (same logic as Insight.tsx).
  const lifeArea = useMemo<LifeAreaCardType | null>(() => {
    if (combined.focus?.key) {
      const fromKey = lifeAreaForFocusKey(combined.focus.key);
      if (fromKey) return fromKey;
    }
    const text = [combined.theme, combined.tension, combined.combined]
      .filter(Boolean)
      .join(" ");
    if (!text) return null;
    return inferLifeAreaFromText(text);
  }, [combined]);

  // Build the step sequence based on card count.
  const steps = useMemo<Step[]>(() => {
    if (cards.length === 0) return [];
    const seq: Step[] = [{ kind: "intro" }];
    cards.forEach((_, i) => seq.push({ kind: "card", cardIndex: i }));
    seq.push({ kind: "underneath" });
    seq.push({ kind: "prompt" });
    seq.push({ kind: "closing" });
    return seq;
  }, [cards]);

  const total = steps.length;
  const current = steps[stepIdx];

  // Moment tinting — keeps the cinematic feel consistent with Insight.
  const moment: MomentNeed | null = id ? getInsightMoment(id) : null;
  const tint = getMomentTint(moment);
  const tintedRing = tint ? `hsl(${tint.ring})` : undefined;

  const goNext = () => {
    if (stepIdx >= total - 1) return;
    haptic("select");
    setStepIdx((i) => Math.min(i + 1, total - 1));
  };
  const goPrev = () => {
    if (stepIdx <= 0) return;
    haptic("select");
    setStepIdx((i) => Math.max(i - 1, 0));
  };

  const swipe = useVerticalSwipe({ onNext: goNext, onPrev: goPrev });

  // Keyboard support — quietly available, never advertised.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
        goNext();
      } else if (e.key === "ArrowUp") {
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, total]);

  if (loading || !insight || !current) {
    return (
      <AppShell showBack backTo={backTo}>
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const isCardStep = current.kind === "card";
  const cardIndex = current.cardIndex ?? 0;
  const card = isCardStep ? cards[cardIndex] : null;
  const isLast = stepIdx === total - 1;

  // Per-step CTA copy
  const ctaCopy = (() => {
    switch (current.kind) {
      case "intro":
        return cards.length === 1 ? "Reveal your card" : "Begin";
      case "card":
        return cardIndex < cards.length - 1
          ? `Reveal ${labels[cardIndex + 1] ?? "next"}`
          : "Look underneath";
      case "underneath":
        return "A question to sit with";
      case "prompt":
        return "Close the reading";
      case "closing":
        return "Open full reflection";
    }
  })();

  const handleCta = () => {
    if (current.kind === "closing") {
      navigate(`/insight/${insight.id}`);
      return;
    }
    goNext();
  };

  // First-prompt extraction — short, strong, single question.
  const firstPrompt =
    cards.flatMap((c) => c.prompts ?? []).find((p) => !!p) ?? "";

  return (
    <AppShell showBack backTo={backTo} ambientMoment={moment} screenMood="reveal">
      <div
        {...swipe}
        className="flex flex-col min-h-[78vh] select-none touch-pan-y"
      >
        {/* Top progress + moment chip */}
        <div className="flex items-center justify-between gap-3 pt-1 pb-3">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === stepIdx
                    ? "w-6 bg-foreground/80"
                    : i < stepIdx
                      ? "w-3 bg-foreground/30"
                      : "w-3 bg-foreground/10"
                }`}
                style={
                  i === stepIdx && tint
                    ? { backgroundColor: tintedRing }
                    : undefined
                }
              />
            ))}
          </div>
          {tint && moment && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] border"
              style={{
                borderColor: `hsl(${tint.ring} / 0.35)`,
                color: tintedRing,
              }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: tintedRing }}
              />
              {MOMENT_LABELS[moment]}
            </span>
          )}
        </div>

        {/* Step body — keyed so each transition fades cleanly */}
        <div
          key={stepIdx}
          className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up"
        >
          {/* INTRO */}
          {current.kind === "intro" && (
            <div className="max-w-sm">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {reading?.label ?? "Your reading"}
              </p>
              <h1 className="font-display text-[28px] leading-tight font-light text-foreground mt-4">
                {cards.length === 1 ? (
                  <>Take a breath. <span className="font-medium italic">One card</span> for this moment.</>
                ) : (
                  <>Take a breath. <span className="font-medium italic">{cards.length} cards</span>, one at a time.</>
                )}
              </h1>
              {(() => {
                const ctxLabel = describeContext(readContext(insight.id));
                return ctxLabel ? (
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/85 mt-4">
                    {ctxLabel}
                  </p>
                ) : null;
              })()}
              {insight.intention && (
                <p className="text-sm italic text-muted-foreground mt-5">
                  "{insight.intention}"
                </p>
              )}
              <p className="text-[13px] text-muted-foreground/80 mt-6 leading-relaxed">
                Meaning unfolds slowly. Move only when you're ready.
              </p>
            </div>
          )}

          {/* CARD STEP */}
          {isCardStep && card && (
            <div className="w-full max-w-sm flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                {labels[cardIndex] ?? `Card ${cardIndex + 1}`}
                {cards.length > 1 && (
                  <>
                    <span className="mx-2 text-muted-foreground/40">·</span>
                    {cardIndex + 1} of {cards.length}
                  </>
                )}
              </p>

              <ReflectionCard card={card} size="lg" revealed />

              <div className="mt-7 max-w-[20rem]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                  {card.category}
                </p>
                <h2 className="font-display text-[24px] font-medium text-foreground">
                  {card.name}
                </h2>
                <p className="text-sm text-muted-foreground italic mt-1">
                  {card.keyword}
                </p>
                <p className="text-[15px] leading-relaxed text-foreground/90 mt-5">
                  {card.shortMeaning}
                </p>
              </div>
            </div>
          )}

          {/* UNDERNEATH — combined insight */}
          {current.kind === "underneath" && (
            <div className="w-full max-w-md">
              <div className="flex items-center justify-center gap-2 mb-5">
                <Sparkles
                  className="h-3.5 w-3.5"
                  strokeWidth={1.8}
                  style={tint ? { color: tintedRing } : { color: "hsl(var(--ink-soft))" }}
                />
                <p
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={tint ? { color: tintedRing } : { color: "hsl(var(--ink-soft))" }}
                >
                  What's underneath
                </p>
              </div>

              {combined.tension ? (
                <p className="font-display text-[22px] leading-snug text-foreground">
                  {combined.tension}
                </p>
              ) : combined.theme ? (
                <p className="font-display text-[22px] leading-snug text-foreground">
                  {combined.theme}
                </p>
              ) : (
                <p className="font-display text-[22px] leading-snug text-foreground">
                  Sit with what these cards together are pointing toward.
                </p>
              )}

              {cards.length > 1 && combined.combined && (
                <p className="text-[14px] leading-relaxed text-foreground/75 mt-5 max-w-md mx-auto">
                  {combined.combined}
                </p>
              )}

              {combined.focus?.label && (
                <div className="mt-7 flex justify-center">
                  <FocusChip
                    label={combined.focus.label}
                    tintRing={tint ? `hsl(${tint.ring} / 0.5)` : undefined}
                  />
                </div>
              )}
            </div>
          )}

          {/* PROMPT — single quiet question */}
          {current.kind === "prompt" && (
            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                A question to sit with
              </p>
              <p className="font-display text-[24px] leading-snug text-foreground italic">
                {firstPrompt || "What part of this is asking for your attention right now?"}
              </p>
              <p className="text-[12px] text-muted-foreground/80 mt-8 leading-relaxed">
                You can write a reflection on the next screen — or simply
                carry the question with you.
              </p>
            </div>
          )}

          {/* CLOSING — final integrated insight */}
          {current.kind === "closing" && (
            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">
                The reading, complete
              </p>

              {insight.ai_reflection ? (
                <p className="font-display text-[20px] leading-snug text-foreground">
                  {firstSentences(insight.ai_reflection, 2)}
                </p>
              ) : combined.combined ? (
                <p className="font-display text-[20px] leading-snug text-foreground">
                  {firstSentences(combined.combined, 2)}
                </p>
              ) : (
                <p className="font-display text-[20px] leading-snug text-foreground">
                  Let what landed land. The rest will catch up.
                </p>
              )}

              {lifeArea && (
                <Link
                  to={`/life-areas/${lifeArea.id}`}
                  state={{ back: `/reading/${insight.id}` }}
                  className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/50 backdrop-blur px-4 py-2 text-[12px] text-foreground/80 hover:bg-card/80 hover:text-foreground transition-smooth"
                >
                  <span className="h-5 w-5 text-[hsl(218_45%_28%)]">
                    <LifeAreaGlyph
                      motif={lifeArea.motif}
                      className="h-full w-full"
                    />
                  </span>
                  Focus area · {lifeArea.name}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Footer — CTA + swipe hint */}
        <div className="pt-8 pb-6 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleCta}
            className="rounded-full bg-gradient-button text-primary-foreground px-7 shadow-cta min-w-[200px] hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            {ctaCopy}
            {isLast ? (
              <ArrowRight className="h-4 w-4 ml-1.5" />
            ) : (
              <ChevronUp className="h-4 w-4 ml-1.5" />
            )}
          </Button>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
            {stepIdx === 0 ? "Swipe up to begin" : isLast ? "Or jump in below" : "Swipe up to continue"}
          </p>
        </div>
      </div>
    </AppShell>
  );
};

// Trim a longer reflection to its first N sentences for the closing beat.
function firstSentences(text: string, n: number): string {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/);
  return parts.slice(0, n).join(" ");
}

export default Reading;
