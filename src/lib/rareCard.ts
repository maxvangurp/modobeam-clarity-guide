// Modobeam — rare "once in a while" cards.
// A small private mythology: a couple of cards live outside the normal
// rotation. They never appear on demand. They surface only when the
// conditions are right — a meaningful return, a sustained moment streak,
// a quiet anniversary. Discovery, not drop rate.

import type { OracleCard } from "@/data/deck";
import type { MomentNeed } from "@/lib/profile";

const SEEN_KEY = "modobeam_rare_seen_v1";

// Hand-authored extra cards. Kept out of the main DECK so they don't
// pollute the standard draw distribution.
export const RARE_DECK: OracleCard[] = [
  {
    id: "threshold",
    name: "Threshold",
    keyword: "On the edge",
    category: "Life Patterns",
    shortMeaning:
      "You're standing at the edge of something. The crossing isn't visible yet, but you can feel it in your body.",
    deeperMeaning:
      "Thresholds rarely announce themselves. They feel like ordinary days that you'll only later recognize as turning points. The work isn't to force the crossing — it's to stop pretending you're not at the edge.",
    prompts: [
      "What is quietly asking to change?",
      "What am I almost ready for?",
      "What would I do if I trusted the timing?",
    ],
  },
  {
    id: "first-light",
    name: "First Light",
    keyword: "Quiet beginning",
    category: "Mind",
    shortMeaning:
      "Something is starting in you, and it's small enough that you could miss it.",
    deeperMeaning:
      "First light doesn't arrive loud. It arrives as a small recurring thought, a quiet preference, a softening you can't fully explain. Notice it before you name it. Naming too early can scare it away.",
    prompts: [
      "What new thought has been visiting me lately?",
      "What am I not yet ready to call by its real name?",
      "What would it mean to honour this before it's certain?",
    ],
  },
];

interface SeenState {
  ids: string[];
  lastAt?: number;
}

function read(): SeenState {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return { ids: [] };
    return JSON.parse(raw) as SeenState;
  } catch {
    return { ids: [] };
  }
}

function write(s: SeenState): void {
  localStorage.setItem(SEEN_KEY, JSON.stringify(s));
}

export function hasSeenRare(id: string): boolean {
  return read().ids.includes(id);
}

export function markRareSeen(id: string): void {
  const s = read();
  if (!s.ids.includes(id)) s.ids.push(id);
  s.lastAt = Date.now();
  write(s);
}

/**
 * Decide whether a rare card should slip into TODAY's daily draw.
 *
 * Conditions (any one is enough):
 *   - User just returned after a meaningful 3+ day gap.
 *   - User has chosen the same moment 3 times in a row.
 *   - It's a quiet anniversary day (multiple of 30 reflections).
 *
 * Plus: never within 14 days of the last rare appearance.
 */
export function shouldOfferRare(opts: {
  drawType: string;
  totalReflections: number;
  daysAway?: number | null;
  momentStreak?: number;
}): OracleCard | null {
  if (opts.drawType !== "daily") return null;

  const s = read();
  if (s.lastAt) {
    const days = (Date.now() - s.lastAt) / (1000 * 60 * 60 * 24);
    if (days < 14) return null;
  }

  const conditions =
    (opts.daysAway !== null && opts.daysAway !== undefined && opts.daysAway >= 3) ||
    (opts.momentStreak !== undefined && opts.momentStreak >= 3) ||
    (opts.totalReflections > 0 && opts.totalReflections % 30 === 0);

  if (!conditions) return null;

  // Pick a rare the user hasn't seen yet, otherwise rotate.
  const unseen = RARE_DECK.filter((c) => !s.ids.includes(c.id));
  const pool = unseen.length ? unseen : RARE_DECK;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Track the moment streak so rareness can react to sustained mood.
const MOMENT_STREAK_KEY = "modobeam_moment_streak_v1";

interface MomentStreak {
  moment: MomentNeed;
  count: number;
  lastDay: string;
}

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function recordMomentForStreak(moment: MomentNeed | null): number {
  if (!moment) return 0;
  const today = todayKey();
  const raw = localStorage.getItem(MOMENT_STREAK_KEY);
  let prev: MomentStreak | null = null;
  try {
    prev = raw ? (JSON.parse(raw) as MomentStreak) : null;
  } catch {
    prev = null;
  }
  if (prev?.lastDay === today && prev.moment === moment) return prev.count;
  const next: MomentStreak =
    prev && prev.moment === moment
      ? { moment, count: prev.count + 1, lastDay: today }
      : { moment, count: 1, lastDay: today };
  localStorage.setItem(MOMENT_STREAK_KEY, JSON.stringify(next));
  return next.count;
}

export function readMomentStreak(): number {
  try {
    const raw = localStorage.getItem(MOMENT_STREAK_KEY);
    if (!raw) return 0;
    const s = JSON.parse(raw) as MomentStreak;
    return s.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Build a small grounded explainer for *why* a rare card surfaced today.
 * Strictly retrospective — references recurring themes, recent return, or
 * sustained moments. Never predictive, never mystical.
 *
 * Returns null if there isn't enough signal to say something honest.
 */
export function explainRareCard(opts: {
  recentThemes: { label: string }[];
  daysAway?: number | null;
  momentStreak?: number;
  totalReflections: number;
}): string | null {
  const themes = opts.recentThemes
    .map((t) => t.label?.trim())
    .filter((t): t is string => Boolean(t))
    .slice(0, 2);

  if (themes.length >= 2) {
    return `You've been circling ${themes[0]} and ${themes[1]} lately. This card tends to arrive when those threads start to meet.`;
  }
  if (themes.length === 1) {
    return `${themes[0].charAt(0).toUpperCase() + themes[0].slice(1)} has been showing up across your recent reflections. This card belongs to that thread.`;
  }
  if (opts.daysAway !== null && opts.daysAway !== undefined && opts.daysAway >= 3) {
    return `You came back after ${opts.daysAway} days away. Returns like this tend to surface a different kind of card.`;
  }
  if (opts.momentStreak !== undefined && opts.momentStreak >= 3) {
    return `You've sat in the same kind of moment ${opts.momentStreak} days running. That sustained note is what brought this card forward.`;
  }
  if (opts.totalReflections > 0 && opts.totalReflections % 30 === 0) {
    return `${opts.totalReflections} reflections in. A quiet marker — this card only appears at thresholds like this.`;
  }
  return null;
}
