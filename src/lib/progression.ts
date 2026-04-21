// Modobeam — progression & discovery
// Tracks how the user is using the app and decides what to reveal next.
// Everything is derived from their saved reflections (no extra storage)
// + a small local store for "what has been suggested already".

import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import {
  READING_TYPES,
  getReadingType,
  type DrawType,
  type ReadingType,
} from "@/data/readingTypes";

const SUGGESTION_DISMISSED_KEY = "modobeam_suggestion_dismissed_v1";
const SUGGESTION_LAST_SHOWN_KEY = "modobeam_suggestion_last_shown_v1";

export interface InsightLite {
  id: string;
  draw_type: string;
  cards: { id: string; name: string }[];
  combined_insight: string | null;
  created_at: string;
}

// Always available from day one — the simple, daily entry points.
export const ALWAYS_UNLOCKED: DrawType[] = ["daily", "three"];

// How many *total* saved reflections are required before a reading appears.
// Kept gentle — discovery should feel earned but never gated for long.
export const UNLOCK_THRESHOLDS: Partial<Record<DrawType, number>> = {
  direction: 3,
  love: 5,
  "next-phase": 8,
  year: 12,
};

export function isReadingUnlocked(type: DrawType, total: number): boolean {
  if (ALWAYS_UNLOCKED.includes(type)) return true;
  const t = UNLOCK_THRESHOLDS[type];
  if (t === undefined) return true;
  return total >= t;
}

export function readingsRemainingToUnlock(
  type: DrawType,
  total: number,
): number {
  if (isReadingUnlocked(type, total)) return 0;
  const t = UNLOCK_THRESHOLDS[type] ?? 0;
  return Math.max(0, t - total);
}

// Decide what to *suggest* next. We only suggest a reading the user has
// just unlocked (within the last 2 reflections of crossing the threshold)
// or one they haven't tried yet.
export function pickSuggestion(
  insights: InsightLite[],
): ReadingType | null {
  const total = insights.length;
  if (total < 2) return null; // give them room to settle in

  const triedTypes = new Set(insights.map((i) => i.draw_type));

  // Order: prefer the most recently unlocked thing they haven't tried.
  const candidates = (Object.keys(UNLOCK_THRESHOLDS) as DrawType[])
    .map((type) => ({ type, threshold: UNLOCK_THRESHOLDS[type] ?? 0 }))
    .filter(({ type, threshold }) => total >= threshold && !triedTypes.has(type))
    // Sort by *most recently* eligible (highest threshold ≤ total)
    .sort((a, b) => b.threshold - a.threshold);

  if (candidates.length === 0) return null;
  return getReadingType(candidates[0].type) ?? null;
}

// Suggestion cadence — once shown, don't push again for ~3 days.
// Once dismissed, hold off ~10 days.
export function shouldShowSuggestion(suggestion: ReadingType | null): boolean {
  if (!suggestion) return false;
  const dismissed = localStorage.getItem(SUGGESTION_DISMISSED_KEY);
  if (dismissed) {
    const days = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
    if (days < 10) return false;
  }
  const last = localStorage.getItem(SUGGESTION_LAST_SHOWN_KEY);
  if (last) {
    const lastObj = JSON.parse(last) as { type: string; at: number };
    const days = (Date.now() - lastObj.at) / (1000 * 60 * 60 * 24);
    if (lastObj.type === suggestion.id && days < 3) return false;
  }
  return true;
}

export function markSuggestionShown(type: DrawType): void {
  localStorage.setItem(
    SUGGESTION_LAST_SHOWN_KEY,
    JSON.stringify({ type, at: Date.now() }),
  );
}

export function dismissSuggestion(): void {
  localStorage.setItem(SUGGESTION_DISMISSED_KEY, String(Date.now()));
}

// Surface recurring themes from the last ~7 reflections.
// Pulls themes/tensions out of `combined_insight` JSON, normalizes lightly,
// and returns the strongest 1–2 recurring threads.
const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","for","with","is",
  "are","was","were","be","been","being","this","that","these","those","you",
  "your","yours","i","me","my","we","our","it","its","as","by","from","into",
  "about","over","under","through","while","what","when","where","which","who",
  "whom","why","how","not","no","yes","do","does","did","done","just","still",
  "really","very","too","more","less","than","then","also","because","so","if",
  "between","they","them","their","there","here","one","ones","like","kind",
  "feel","feels","feeling","felt","seem","seems","seemed","might","could",
  "would","should","may","can","will","its","get","got","getting","go","goes",
  "going","want","wants","need","needs","know","knows","knowing","thing",
  "things","something","someone","everyone","everything","anything","nothing",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export interface ThemeInsight {
  // Short human-readable label for the recurring thread
  label: string;
  // How many reflections it appeared in
  count: number;
  // Sample words behind the thread (used for transparency / debugging)
  words: string[];
}

// Lightweight heuristic: extract themes from the AI-generated `theme` and
// `tension` fields across the last `recentN` reflections, find words that
// appear in 2+ reflections, and group them.
export function detectRecentThemes(
  insights: InsightLite[],
  recentN = 7,
): ThemeInsight[] {
  const recent = insights.slice(0, recentN);
  if (recent.length < 2) return [];

  // word → set of reflection indexes it appeared in
  const wordReflections = new Map<string, Set<number>>();

  recent.forEach((r, i) => {
    let theme = "";
    let tension = "";
    if (r.combined_insight) {
      try {
        const p = JSON.parse(r.combined_insight);
        theme = p.theme ?? "";
        tension = p.tension ?? "";
      } catch {
        theme = r.combined_insight;
      }
    }
    // Also pull card names — they often *are* the theme word
    const cardWords = r.cards.map((c) => c.name).join(" ");
    const text = `${theme} ${tension} ${cardWords}`;
    const seen = new Set<string>();
    for (const w of tokenize(text)) {
      if (seen.has(w)) continue;
      seen.add(w);
      if (!wordReflections.has(w)) wordReflections.set(w, new Set());
      wordReflections.get(w)!.add(i);
    }
  });

  // Keep words that appear in ≥ 2 reflections
  const recurring = [...wordReflections.entries()]
    .filter(([, set]) => set.size >= 2)
    .map(([w, set]) => ({ word: w, count: set.size }))
    .sort((a, b) => b.count - a.count);

  if (recurring.length === 0) return [];

  // Return up to 2 strongest threads as separate themes; keep them short
  return recurring.slice(0, 2).map((r) => ({
    label: r.word,
    count: r.count,
    words: [r.word],
  }));
}

// Small fetcher used by the home screen — returns the last ~14 saved
// reflections for the current session/user.
export async function fetchRecentInsights(
  limit = 14,
): Promise<InsightLite[]> {
  const session_id = getSessionId();
  const { data, error } = await supabase
    .from("insights")
    .select("id, draw_type, cards, combined_insight, created_at")
    .eq("session_id", session_id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as unknown as InsightLite[];
}
