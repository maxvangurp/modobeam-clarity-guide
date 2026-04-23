// Modobeam — category accent palette
//
// Each card category carries its own quiet emotional color. Used as a
// subtle accent (dot, border, glow) — never as a flood. Stays calm at
// rest, leans premium when paired with the moment tint.
//
// Mind     → cool blue        (cognition, clarity)
// Emotion  → soft violet      (feeling, lilac haze)
// Action   → muted amber      (warmth, momentum)
// Life     → deep indigo      (direction, depth)
//
// All HSL strings — pair with `hsl(...)`/alpha in components.

import type { CardCategory } from "@/data/deck";

export interface CategoryAccent {
  /** Solid mid-tone, e.g. for dots / icons */
  hsl: string;
  /** Softer label / ring color */
  ring: string;
  /** Very soft background tint (use with /20–/40 alpha) */
  bg: string;
  /** Two-stop gradient string for accent orbs */
  gradient: string;
}

export const CATEGORY_ACCENTS: Record<CardCategory, CategoryAccent> = {
  Mind: {
    hsl: "211 60% 58%",
    ring: "211 50% 48%",
    bg: "211 60% 92%",
    gradient:
      "linear-gradient(135deg, hsl(211 70% 82%) 0%, hsl(211 55% 60%) 100%)",
  },
  Emotion: {
    hsl: "275 38% 62%",
    ring: "275 32% 52%",
    bg: "285 45% 93%",
    gradient:
      "linear-gradient(135deg, hsl(285 55% 88%) 0%, hsl(275 40% 64%) 100%)",
  },
  Action: {
    hsl: "32 65% 60%",
    ring: "28 55% 50%",
    bg: "35 70% 92%",
    gradient:
      "linear-gradient(135deg, hsl(38 80% 84%) 0%, hsl(28 65% 58%) 100%)",
  },
  "Life Patterns": {
    hsl: "232 42% 48%",
    ring: "232 38% 40%",
    bg: "232 45% 92%",
    gradient:
      "linear-gradient(135deg, hsl(232 55% 82%) 0%, hsl(232 45% 46%) 100%)",
  },
  Relationships: {
    hsl: "342 46% 58%",
    ring: "342 40% 48%",
    bg: "342 48% 93%",
    gradient:
      "linear-gradient(135deg, hsl(342 58% 88%) 0%, hsl(342 44% 60%) 100%)",
  },
  Growth: {
    hsl: "148 34% 48%",
    ring: "148 30% 40%",
    bg: "148 30% 92%",
    gradient:
      "linear-gradient(135deg, hsl(148 36% 86%) 0%, hsl(148 34% 50%) 100%)",
  },
  "Inner World": {
    hsl: "196 34% 54%",
    ring: "196 30% 44%",
    bg: "196 38% 93%",
    gradient:
      "linear-gradient(135deg, hsl(196 42% 88%) 0%, hsl(196 34% 56%) 100%)",
  },
};

export function getCategoryAccent(
  category: CardCategory | string | undefined,
): CategoryAccent {
  if (!category) return CATEGORY_ACCENTS["Life Patterns"];
  return (
    CATEGORY_ACCENTS[category as CardCategory] ??
    CATEGORY_ACCENTS["Life Patterns"]
  );
}
