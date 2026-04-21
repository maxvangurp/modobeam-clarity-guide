// Modobeam — theme-driven unlock hints
// Layered on top of the count-based UNLOCK_THRESHOLDS: when recurring
// themes naturally point toward a category, we softly nudge that reading
// forward instead of waiting for a generic count threshold to surface it.

import type { ThemeInsight } from "@/lib/progression";
import type { DrawType } from "@/data/readingTypes";

// Words → reading types they hint at. Kept loose; a single match is enough.
const THEME_TO_READING: Record<string, DrawType> = {
  // Direction
  stuck: "direction",
  direction: "direction",
  decision: "direction",
  choice: "direction",
  path: "direction",
  next: "direction",
  step: "direction",
  move: "direction",
  forward: "direction",
  // Love / emotion
  love: "love",
  partner: "love",
  relationship: "love",
  attachment: "love",
  longing: "love",
  heart: "love",
  intimacy: "love",
  closeness: "love",
  alone: "love",
  // Next phase
  ending: "next-phase",
  beginning: "next-phase",
  change: "next-phase",
  threshold: "next-phase",
  transition: "next-phase",
  release: "next-phase",
  return: "next-phase",
  // Year
  year: "year",
  trajectory: "year",
  pattern: "year",
  patterns: "year",
};

export interface ReadingHint {
  type: DrawType;
  matchedTheme: string;
}

/**
 * Returns a single reading type the recurring themes seem to be pointing
 * at, or null if nothing matches. Used as a *hint* — the count-based
 * unlock still has the final word on availability.
 */
export function inferReadingHint(themes: ThemeInsight[]): ReadingHint | null {
  for (const t of themes) {
    const word = t.label.toLowerCase();
    const target = THEME_TO_READING[word];
    if (target) return { type: target, matchedTheme: t.label };
  }
  return null;
}
