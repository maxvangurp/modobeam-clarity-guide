// Modobeam — weekly synthesis surface
// A quiet, once-a-week card that reflects back the user's last 7 days.
// Lazy: only fetches when expanded and uncached. Always dismissable.

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  type WeeklySynthesis,
  dismissWeeklySynthesis,
  readCachedSynthesis,
  writeCachedSynthesis,
} from "@/lib/weeklySynthesis";
import type { InsightLite } from "@/lib/progression";

interface Props {
  weekId: string;
  recent: InsightLite[];
  onDismiss: () => void;
}

export const WeeklySynthesisCard = ({ weekId, recent, onDismiss }: Props) => {
  const cached = readCachedSynthesis();
  const initial =
    cached && cached.weekId === weekId ? cached : null;

  const [synth, setSynth] = useState<WeeklySynthesis | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (synth || loading || recent.length < 3) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase.functions.invoke(
          "summarize-period",
          {
            body: {
              period: "week",
              readings: recent.map((r) => ({
                draw_type: r.draw_type,
                cards: r.cards,
                combined_insight: r.combined_insight,
                created_at: r.created_at,
              })),
            },
          },
        );
        if (cancelled) return;
        if (err) throw err;
        if ((data as { error?: string })?.error) {
          throw new Error((data as { error?: string }).error);
        }
        const next: WeeklySynthesis = {
          weekId,
          corePattern: (data as { corePattern?: string }).corePattern ?? "",
          themes: (data as { themes?: string[] }).themes ?? [],
          summary: (data as { summary?: string }).summary ?? "",
          generatedAt: new Date().toISOString(),
        };
        if (!next.summary && !next.corePattern) {
          setError(true);
          return;
        }
        writeCachedSynthesis(next);
        setSynth(next);
      } catch (e) {
        console.error("weekly synthesis failed", e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We intentionally only run this effect once on mount per week.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error && !synth) return null;

  return (
    <section className="mt-2 mb-6 animate-fade-up">
      <div className="rounded-3xl bg-gradient-dawn border border-border/40 px-5 py-5 shadow-soft relative">
        <button
          onClick={() => {
            dismissWeeklySynthesis(weekId);
            onDismiss();
          }}
          aria-label="Dismiss"
          className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground transition-smooth"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-soft/70 mb-2">
          Your week, in one breath
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Reading what's been here…</span>
          </div>
        )}

        {synth && (
          <>
            {synth.corePattern && (
              <p className="font-display text-[17px] leading-snug text-foreground italic">
                {synth.corePattern}
              </p>
            )}
            {synth.summary && (
              <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">
                {synth.summary}
              </p>
            )}
            {synth.themes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {synth.themes.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border/40"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
