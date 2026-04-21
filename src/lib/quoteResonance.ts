// Modobeam — soft resonance between the daily quote and recurring themes.
// We don't try to be clever; a single shared meaningful word is enough
// to whisper "this isn't a coincidence" without claiming it.

import type { DailyQuote } from "@/lib/dailyQuote";
import type { ThemeInsight } from "@/lib/progression";

const STOP = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","for","with","is",
  "are","was","were","be","been","being","this","that","these","those","you",
  "your","yours","i","me","my","we","our","it","its","as","by","from","into",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

/**
 * Returns the theme word that resonates with the quote, if any.
 * Tiny intentional behaviour: caller can choose to surface a one-line
 * caption like "a recurring thread for you lately."
 */
export function resonantTheme(
  quote: DailyQuote,
  themes: ThemeInsight[],
): string | null {
  if (!themes.length) return null;
  const qTokens = new Set(tokens(quote.text));
  for (const t of themes) {
    if (qTokens.has(t.label.toLowerCase())) return t.label;
  }
  return null;
}
