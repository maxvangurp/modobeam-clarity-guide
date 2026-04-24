/** Shared shape of a row returned from the `insights` Supabase table. */
export interface InsightRow {
  id: string;
  intention: string | null;
  draw_type: string;
  cards: { id: string; name: string }[];
  combined_insight: string | null;
  ai_reflection: string | null;
  created_at: string;
}

/** Parsed shape of `InsightRow.combined_insight` (stored as JSON). */
export interface Combined {
  theme?: string;
  tension?: string;
  combined?: string;
  focus?: { key: string; label: string } | null;
}
