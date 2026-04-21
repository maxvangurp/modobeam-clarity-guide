// Modobeam — AI continuity
// Helpers to package the user's last few saved reflections into a compact
// "memory" payload sent to the reflect edge function. The point isn't to
// dump history into the prompt — it's to give the AI just enough context to
// occasionally say "you've sat with this before" with real specificity.

import type { InsightLite } from "@/lib/progression";

export interface PriorThread {
  /** YYYY-MM-DD of the prior reflection */
  date: string;
  theme: string;
  tension: string;
  cards: string[];
}

/**
 * Build a small memory payload from up to N prior reflections.
 * Returns an empty array when nothing useful is available.
 */
export function buildPriorThreads(
  insights: InsightLite[],
  n = 3,
): PriorThread[] {
  return insights
    .slice(0, n)
    .map((i) => {
      let theme = "";
      let tension = "";
      if (i.combined_insight) {
        try {
          const p = JSON.parse(i.combined_insight) as {
            theme?: string;
            tension?: string;
          };
          theme = p.theme ?? "";
          tension = p.tension ?? "";
        } catch {
          // plain text — leave empty
        }
      }
      return {
        date: new Date(i.created_at).toISOString().slice(0, 10),
        theme,
        tension,
        cards: i.cards.map((c) => c.name),
      } satisfies PriorThread;
    })
    .filter((t) => t.theme || t.tension || t.cards.length);
}
