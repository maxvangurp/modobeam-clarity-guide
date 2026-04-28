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

/**
 * Single source of truth for unwrapping `combined_insight`.
 * The column historically stored either a JSON blob or — in older rows —
 * a plain string. This helper hides both shapes from callers.
 */
export function parseCombined(raw: string | null | undefined): Combined {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Combined;
  } catch {
    return { combined: raw };
  }
  return {};
}
