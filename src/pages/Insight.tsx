import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { getReadingType } from "@/data/readingTypes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getCardById } from "@/data/deck";
import { getSessionId } from "@/lib/session";
import { recordReflectionSaved, MOMENT_LABELS, type MomentNeed } from "@/lib/profile";
import { getInsightMoment } from "@/lib/insightMoment";
import { getMomentTint } from "@/lib/momentTint";
import { haptic } from "@/lib/haptics";
import {
  recordMood,
  getMoodForInsight,
  MOOD_LABELS,
  type MoodSnap,
} from "@/lib/moodSnapshot";
import { LifeAreaGlyph } from "@/components/LifeAreaGlyph";
import { FocusChip } from "@/components/FocusChip";
import { getCategoryAccent } from "@/lib/categoryAccent";
import {
  inferLifeAreaFromText,
  lifeAreaForFocusKey,
  type LifeAreaCard as LifeAreaCardType,
} from "@/data/lifeAreas";
import { KeepThisCard } from "@/components/KeepThisCard";
import { NotQuiteIt } from "@/components/NotQuiteIt";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  Sparkles,
  Bookmark,
  CalendarDays,
  Sunrise,
  ArrowRight,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

interface InsightRow {
  id: string;
  intention: string | null;
  draw_type: string;
  cards: { id: string; name: string }[];
  combined_insight: string | null;
  ai_reflection: string | null;
  created_at: string;
}

interface Combined {
  theme?: string;
  tension?: string;
  combined?: string;
  focus?: { key: string; label: string } | null;
}

const Insight = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<InsightRow | null>(null);
  const [journal, setJournal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [skippedJournal, setSkippedJournal] = useState(false);
  const [savedMood, setSavedMood] = useState<MoodSnap | null>(null);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [keepOpen, setKeepOpen] = useState(false);
  const [showNotQuite, setShowNotQuite] = useState(false);

  const summaryRef = useRef<HTMLDivElement | null>(null);
  const nextStepsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Insight not found");
        navigate("/");
        return;
      }
      setInsight(data as unknown as InsightRow);

      const { data: jd } = await supabase
        .from("journal_entries")
        .select("content")
        .eq("insight_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (jd?.content) {
        setJournal(jd.content);
        setSaved(true);
        // Don't auto-fetch summary on reload; user can re-trigger if they edit.
      }
      // Restore any prior mood snapshot for this insight
      const existingMood = id ? getMoodForInsight(id) : null;
      if (existingMood) setSavedMood(existingMood);
      setLoading(false);
    })();
  }, [id, navigate]);

  const combined = useMemo<Combined>(() => {
    if (!insight?.combined_insight) return {};
    try {
      const parsed = JSON.parse(insight.combined_insight);
      if (parsed && typeof parsed === "object") return parsed as Combined;
    } catch {
      return { combined: insight.combined_insight };
    }
    return {};
  }, [insight]);

  const cards = useMemo(() => {
    if (!insight) return [];
    return insight.cards
      .map((c) => getCardById(c.id))
      .filter(Boolean) as NonNullable<ReturnType<typeof getCardById>>[];
  }, [insight]);

  // Map this reading to one Life Area card. Prefer the astrology focus key
  // (already saved on the insight); fall back to a light keyword scan of
  // the combined reflection text. Returns null when neither produces a fit.
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
  const [lifeAreaOpen, setLifeAreaOpen] = useState(false);

  const reading = insight ? getReadingType(insight.draw_type) : null;
  const labels = reading?.positionLabels ?? ["Today"];
  const moment: MomentNeed | null = id ? getInsightMoment(id) : null;
  const tint = getMomentTint(moment);
  const tintedSoftBg = tint ? `hsl(${tint.bg} / 0.55)` : undefined;
  const tintedRing = tint ? `hsl(${tint.ring})` : undefined;
  const tintedAccentBg = tint
    ? `linear-gradient(135deg, hsl(${tint.bg}) 0%, hsl(${tint.hsl} / 0.85) 100%)`
    : undefined;
  const tintedGlow = tint ? `0 0 28px hsl(${tint.hsl} / 0.35)` : undefined;

  const fetchSummary = async (text: string) => {
    if (!text.trim() || !insight) return;
    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "reflect-summary",
        {
          body: {
            journal: text.trim(),
            cards: cards.map((c) => ({ name: c.name, keyword: c.keyword })),
            theme: combined.theme,
            tension: combined.tension,
            reflection: insight.ai_reflection ?? "",
          },
        },
      );
      if (error) throw error;
      const s = (data as { summary?: string })?.summary?.trim() ?? "";
      setSummary(s);
      // Soft scroll into view
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 60);
    } catch (e) {
      console.error(e);
      // Silent — the journal is already saved, the summary is a bonus.
    } finally {
      setSummaryLoading(false);
    }
  };

  const saveJournal = async () => {
    if (!journal.trim() || !id) return;
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({
      insight_id: id,
      session_id: getSessionId(),
      content: journal.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error("Couldn't save. Try again.");
      return;
    }
    setSaved(true);
    haptic("save");
    const { count, isNewDay } = recordReflectionSaved();
    // Quietly recognize depth without scoring it visibly.
    const wordCount = journal.trim().split(/\s+/).filter(Boolean).length;
    const landed = wordCount >= 80;
    if (landed) {
      toast.success("That landed");
    } else if (isNewDay && count > 1) {
      toast.success(`Saved · ${count} days in a row`);
    } else if (isNewDay && count === 1) {
      toast.success("Saved · a quiet start");
    } else {
      toast.success("Saved");
    }
    fetchSummary(journal);
  };

  const skipJournal = () => {
    setSkippedJournal(true);
    // No auto-scroll — let the mood snapshot affordance bloom in place
    // and only nudge after they tap (or skip) it.
  };

  const pickMood = (m: MoodSnap) => {
    if (!id) return;
    haptic("select");
    recordMood(id, m);
    setSavedMood(m);
    toast.success("Noted softly");
    setTimeout(() => {
      nextStepsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  if (loading || !insight) {
    return (
      <AppShell showBack backTo="/">
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const prompts = Array.from(new Set(cards.flatMap((c) => c.prompts))).slice(
    0,
    3,
  );

  const showSummarySection = saved || summaryLoading || summary;
  const showNextSteps = saved || skippedJournal;

  return (
    <AppShell showBack backTo="/" screenMood="reflect">
      {/* Header — tinted by the moment chosen for this reading */}
      <section className="pt-2 pb-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <p
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
            style={tint ? { color: tintedRing } : undefined}
          >
            Your reflection
          </p>
          {tint && moment && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] border"
              style={{
                backgroundColor: tintedSoftBg,
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
        {insight.intention && (
          <p className="text-sm italic text-muted-foreground">
            "{insight.intention}"
          </p>
        )}
      </section>

      {/* Cards */}
      <section className="space-y-3 animate-fade-up [animation-delay:80ms]">
        {cards.map((card, i) => {
          const accent = getCategoryAccent(card.category);
          // The orb on each card leans on the card's own category accent.
          // The moment tint, when present, gently re-tones the border.
          const orbBg = `linear-gradient(135deg, hsl(${accent.bg}) 0%, hsl(${accent.hsl}) 100%)`;
          const orbGlow = `0 0 24px hsl(${accent.hsl} / 0.32)`;
          return (
            <article
              key={card.id}
              className="rounded-3xl bg-card/70 backdrop-blur p-5 shadow-soft border"
              style={
                tint
                  ? { borderColor: `hsl(${tint.ring} / 0.22)` }
                  : { borderColor: `hsl(${accent.ring} / 0.18)` }
              }
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] mb-1 inline-flex items-center gap-1.5"
                    style={{ color: `hsl(${accent.ring})` }}
                  >
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: `hsl(${accent.hsl})` }}
                    />
                    {labels[i]} · {card.category}
                  </p>
                  <h3 className="font-display text-xl font-medium">
                    {card.name}
                  </h3>
                  <p className="text-sm text-muted-foreground italic">
                    {card.keyword}
                  </p>
                </div>
                <div
                  className="h-10 w-10 rounded-full shrink-0"
                  style={{
                    backgroundImage: orbBg,
                    boxShadow: orbGlow,
                  }}
                />
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                {card.shortMeaning}
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {card.deeperMeaning}
              </p>
            </article>
          );
        })}
      </section>

      {/* The insight layer — emotional pattern lifted up */}
      {(combined.theme || combined.tension || combined.combined) && (
        <section className="mt-7 animate-fade-up [animation-delay:160ms]">
          <div
            className="rounded-3xl bg-gradient-dawn p-6 shadow-soft border"
            style={
              tint
                ? {
                    borderColor: `hsl(${tint.ring} / 0.3)`,
                    boxShadow: `var(--shadow-soft), 0 0 40px hsl(${tint.hsl} / 0.18)`,
                  }
                : { borderColor: "hsl(var(--border) / 0.4)" }
            }
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-3.5 w-3.5"
                  strokeWidth={1.8}
                  style={tint ? { color: tintedRing } : { color: "hsl(var(--ink-soft))" }}
                />
                <h2
                  className="font-display text-[10px] uppercase tracking-[0.25em]"
                  style={tint ? { color: tintedRing } : { color: "hsl(var(--ink-soft))" }}
                >
                  What's underneath
                </h2>
              </div>
              {combined.focus?.label && (
                <FocusChip
                  label={combined.focus.label}
                  tintRing={tint ? `hsl(${tint.ring} / 0.5)` : undefined}
                />
              )}
            </div>

            {combined.tension ? (
              <p className="font-display text-[17px] leading-snug text-foreground">
                {combined.tension}
              </p>
            ) : combined.theme ? (
              <p className="font-display text-[17px] leading-snug text-foreground">
                {combined.theme}
              </p>
            ) : null}

            {combined.combined && (
              <p className="mt-4 text-[14px] leading-relaxed text-foreground/80">
                {combined.combined}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Life Area — quiet contextual layer, derived from the reading.
          Framed as a "Focus area": context for the reflection, never a label
          on the user. */}
      {lifeArea && (
        <section className="mt-4 animate-fade-up [animation-delay:200ms]">
          <button
            type="button"
            onClick={() => setLifeAreaOpen((o) => !o)}
            aria-expanded={lifeAreaOpen}
            className="w-full text-left rounded-3xl border border-border/50 bg-[linear-gradient(140deg,hsl(40_30%_97%)_0%,hsl(211_42%_92%)_55%,hsl(218_36%_85%)_100%)] px-5 py-4 shadow-soft hover:shadow-card transition-smooth"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-background/55 backdrop-blur flex items-center justify-center shrink-0 text-[hsl(218_45%_28%)] p-1.5">
                <LifeAreaGlyph motif={lifeArea.motif} className="h-full w-full" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[hsl(218_30%_38%)]/80">
                  Focus area
                </p>
                <p className="font-display text-[16px] text-foreground mt-0.5">
                  {lifeArea.name}
                </p>
              </div>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${lifeAreaOpen ? "rotate-90" : ""}`}
              />
            </div>
            {lifeAreaOpen && (
              <div className="mt-4 pt-4 border-t border-border/40 animate-fade-up space-y-3">
                {/* Why this area — short, soft framing */}
                <p className="text-[13px] leading-relaxed text-foreground/75 italic">
                  This reflection may be showing up in the area of{" "}
                  <span className="not-italic font-medium text-foreground/85">
                    {lifeArea.name.toLowerCase()}
                  </span>{" "}
                  — {lifeArea.theme.toLowerCase()}.
                </p>

                <p className="text-[14px] leading-relaxed text-foreground/85">
                  {lifeArea.shortMeaning}
                </p>

                {/* One quiet prompt — invitation, not assignment */}
                {lifeArea.prompts[0] && (
                  <div className="rounded-2xl bg-background/40 backdrop-blur border border-border/40 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(218_30%_38%)]/80 mb-1">
                      A question to sit with
                    </p>
                    <p className="text-[13px] leading-relaxed text-foreground/85">
                      {lifeArea.prompts[0]}
                    </p>
                  </div>
                )}

                <Link
                  to={`/life-areas/${lifeArea.id}`}
                  className="inline-flex items-center gap-1 text-[12px] text-foreground/70 hover:text-foreground transition-smooth"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open full card
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </button>
        </section>
      )}

      {/* AI reflection */}
      {insight.ai_reflection && (
        <section className="mt-4 rounded-3xl bg-card/70 backdrop-blur border border-border/60 p-6 shadow-soft animate-fade-up [animation-delay:220ms]">
          <h2 className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            A reflection for you
          </h2>
          <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
            {insight.ai_reflection}
          </p>
        </section>
      )}

      {/* Reflection moment */}
      <section className="mt-10 animate-fade-up [animation-delay:280ms]">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
          A moment with yourself
        </p>
        <h2 className="font-display text-[22px] leading-tight font-light text-foreground">
          Take a moment to <span className="font-medium italic">reflect</span>.
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          A few honest lines is enough. Nothing has to be polished.
        </p>

        {prompts.length > 0 && (
          <div className="mt-5 rounded-2xl bg-card/40 backdrop-blur border border-border/40 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="font-display text-muted-foreground/70 tabular-nums shrink-0 text-[12px] mt-0.5">
                {String(activePromptIdx + 1).padStart(2, "0")}/{String(prompts.length).padStart(2, "0")}
              </span>
              <p
                key={activePromptIdx}
                className="text-[15px] text-foreground/90 leading-relaxed flex-1 animate-fade-up"
              >
                {prompts[activePromptIdx]}
              </p>
            </div>
            {prompts.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActivePromptIdx((i) => (i + 1) % prompts.length)
                }
                className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-smooth"
              >
                Try another <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <Textarea
          value={journal}
          onChange={(e) => {
            setJournal(e.target.value);
            setSaved(false);
            setSummary("");
          }}
          placeholder="Write freely…"
          rows={6}
          className="mt-5 resize-none rounded-2xl bg-card/80 border-border/60 backdrop-blur text-base"
        />

        <div className="flex justify-between items-center mt-3 gap-3">
          <button
            onClick={skipJournal}
            type="button"
            disabled={skippedJournal || saved}
            className="text-sm text-muted-foreground hover:text-foreground transition-smooth disabled:opacity-50"
          >
            Not right now
          </button>
          <Button
            onClick={saveJournal}
            disabled={!journal.trim() || saving || saved}
            className={`rounded-full bg-gradient-button text-primary-foreground px-6 shadow-cta hover:scale-[1.01] active:scale-[0.99] transition-transform ${
              saved ? "animate-save-glow" : ""
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-1.5" /> Saved
              </>
            ) : (
              "Save reflection"
            )}
          </Button>
        </div>

        {/* Mood snapshot — appears when the user skips. One quiet tap. */}
        {skippedJournal && !saved && (
          <div className="mt-5 rounded-2xl bg-card/50 backdrop-blur border border-border/50 px-5 py-4 animate-fade-up">
            {savedMood ? (
              <p className="text-[13px] text-foreground/80 leading-relaxed">
                Noted —{" "}
                <span className="italic text-foreground">
                  {MOOD_LABELS[savedMood].toLowerCase()}
                </span>
                . That's enough for today.
              </p>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                  How does today feel?
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(MOOD_LABELS) as MoodSnap[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => pickMood(m)}
                      className="px-3.5 py-1.5 rounded-full text-[12px] bg-card/70 text-foreground/80 border border-border/60 hover:bg-card hover:text-foreground transition-smooth backdrop-blur"
                    >
                      {MOOD_LABELS[m]}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[11px] text-muted-foreground/70">
                  One tap is enough. No words needed.
                </p>
              </>
            )}
          </div>
        )}
      </section>

      {/* Personal AI summary — appears after journaling */}
      {showSummarySection && (
        <section
          ref={summaryRef}
          className="mt-8 animate-fade-up"
        >
          <div className="rounded-3xl bg-card/60 backdrop-blur border border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-beam shadow-glow" />
              <h2 className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                What I'm hearing
              </h2>
            </div>
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Reading what you wrote…
              </div>
            ) : summary ? (
              <p className="font-display text-[17px] leading-snug text-foreground/95 italic">
                {summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Saved. Your words are yours — that's already the work.
              </p>
            )}
            {saved && !summaryLoading && !summary && journal.trim() && (
              <button
                type="button"
                onClick={() => fetchSummary(journal)}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-smooth underline underline-offset-4"
              >
                Mirror this back to me
              </button>
            )}

            {/* Quiet actions on the AI mirror */}
            {summary && !summaryLoading && (
              <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    haptic("select");
                    setKeepOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-smooth"
                >
                  <ImageIcon className="h-3 w-3" strokeWidth={1.8} />
                  Keep this
                </button>
                <span className="text-muted-foreground/30 text-[10px]">·</span>
                <button
                  type="button"
                  onClick={() => setShowNotQuite((v) => !v)}
                  className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-smooth"
                >
                  That's not quite it →
                </button>
              </div>
            )}

            {showNotQuite && summary && (
              <NotQuiteIt
                open={showNotQuite}
                onClose={() => setShowNotQuite(false)}
                originalSummary={summary}
                cards={cards.map((c) => ({ name: c.name, keyword: c.keyword }))}
                onRevised={(revised) => setSummary(revised)}
              />
            )}
          </div>
        </section>
      )}

      <KeepThisCard
        open={keepOpen}
        onOpenChange={setKeepOpen}
        summary={summary}
        moment={moment}
      />

      {/* Soft next steps — never an end */}
      {showNextSteps && (
        <section
          ref={nextStepsRef}
          className="mt-10 mb-4 animate-fade-up"
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Where to go from here
          </p>

          <div className="space-y-2">
            <NextStepLink
              to={`/draw/${insight.draw_type}`}
              icon={<ArrowRight className="h-4 w-4" />}
              title="Keep reflecting"
              hint="Pull another card on this thread"
            />
            <NextStepLink
              to="/history"
              icon={<Bookmark className="h-4 w-4" />}
              title="Save this moment"
              hint="It's already in your history"
            />
            <NextStepLink
              to="/history"
              icon={<CalendarDays className="h-4 w-4" />}
              title="See your week"
              hint="Notice what's been recurring"
            />
            <NextStepLink
              to="/"
              icon={<Sunrise className="h-4 w-4" />}
              title="Come back tomorrow"
              hint="Some things land overnight"
            />
          </div>

          <p className="text-center text-[12px] text-muted-foreground/70 mt-6 italic">
            Nothing here ends — it just rests for now.
          </p>
        </section>
      )}
    </AppShell>
  );
};

interface StepProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
}

const NextStepLink = ({ to, icon, title, hint }: StepProps) => (
  <Link
    to={to}
    className="group flex items-center gap-3 rounded-2xl bg-card/50 backdrop-blur border border-border/40 px-4 py-3.5 hover:bg-card/80 hover:border-border/70 transition-smooth"
  >
    <span className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground transition-smooth">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-medium text-foreground/90 leading-tight">
        {title}
      </p>
      <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">
        {hint}
      </p>
    </div>
    <span className="text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-smooth">
      →
    </span>
  </Link>
);

export default Insight;
