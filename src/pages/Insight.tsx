import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getCardById } from "@/data/deck";
import { getSessionId } from "@/lib/session";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

interface InsightRow {
  id: string;
  intention: string | null;
  draw_type: "daily" | "three";
  cards: { id: string; name: string }[];
  combined_insight: string | null;
  ai_reflection: string | null;
  created_at: string;
}


const Insight = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<InsightRow | null>(null);
  const [journal, setJournal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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

      // Load any existing journal entry
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
      }
      setLoading(false);
    })();
  }, [id, navigate]);

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
    toast.success("Saved to your history");
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

  const cards = insight.cards
    .map((c) => getCardById(c.id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getCardById>>[];

  const labels =
    insight.draw_type === "three"
      ? ["Past influence", "Present focus", "Emerging"]
      : ["Today"];

  return (
    <AppShell showBack backTo="/">
      <section className="pt-2 pb-6 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Your insight
        </p>
        {insight.intention && (
          <p className="text-sm italic text-muted-foreground mb-4">
            "{insight.intention}"
          </p>
        )}
      </section>

      {/* Cards summary */}
      <section className="space-y-3 animate-fade-up [animation-delay:80ms]">
        {cards.map((card, i) => (
          <article
            key={card.id}
            className="rounded-3xl bg-card/70 backdrop-blur border border-border/60 p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {labels[i]} · {card.category}
                </p>
                <h3 className="font-display text-xl font-medium">
                  {card.name}
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  {card.keyword}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-beam-soft to-beam/70 shadow-glow shrink-0" />
            </div>
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {card.shortMeaning}
            </p>
          </article>
        ))}
      </section>

      {/* Combined insight */}
      {insight.combined_insight && (
        <section className="mt-6 rounded-3xl bg-gradient-dawn border border-border/40 p-6 shadow-soft animate-fade-up [animation-delay:160ms]">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ink-soft mb-3">
            Together
          </h2>
          <p className="text-[15px] leading-relaxed text-foreground">
            {insight.combined_insight}
          </p>
        </section>
      )}

      {/* AI reflection */}
      {insight.ai_reflection && (
        <section className="mt-4 rounded-3xl bg-card/70 backdrop-blur border border-border/60 p-6 shadow-soft animate-fade-up [animation-delay:220ms]">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
            A reflection for you
          </h2>
          <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
            {insight.ai_reflection}
          </p>
        </section>
      )}

      {/* Reflection journal */}
      <section className="mt-8 animate-fade-up [animation-delay:280ms]">
        <h2 className="font-display text-lg font-medium mb-1">Reflect</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Take a few minutes. Honesty is the only requirement.
        </p>

        <ul className="space-y-2 mb-4">
          {REFLECTION_QUESTIONS.map((q, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm text-foreground/85 leading-relaxed"
            >
              <span className="font-display text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ul>

        <Textarea
          value={journal}
          onChange={(e) => {
            setJournal(e.target.value);
            setSaved(false);
          }}
          placeholder="Write freely..."
          rows={6}
          className="resize-none rounded-2xl bg-card/80 border-border/60 backdrop-blur text-base"
        />

        <div className="flex justify-between items-center mt-3">
          <Link
            to="/history"
            className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            See history
          </Link>
          <Button
            onClick={saveJournal}
            disabled={!journal.trim() || saving || saved}
            className="rounded-full bg-gradient-button text-primary-foreground px-6"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-1.5" /> Saved
              </>
            ) : (
              "Save entry"
            )}
          </Button>
        </div>
      </section>
    </AppShell>
  );
};

export default Insight;
