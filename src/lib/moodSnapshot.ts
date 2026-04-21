// Modobeam — lightweight mood snapshots
// When a user taps "Not right now" on the journal, they can still leave a
// one-tap mood. It's saved silently, surfaces in History, and can power
// future patterns. No streak penalty, no friction.

const KEY = "modobeam_mood_snapshots_v1";

export type MoodSnap = "tender" | "clear" | "unsure" | "heavy" | "lit";

export const MOOD_LABELS: Record<MoodSnap, string> = {
  tender: "A little tender",
  clear: "Clear",
  unsure: "Unsure",
  heavy: "Heavy",
  lit: "Lit up",
};

export interface MoodEntry {
  insightId: string;
  mood: MoodSnap;
  at: string; // ISO
}

export function recordMood(insightId: string, mood: MoodSnap): void {
  const list = readMoods();
  list.unshift({ insightId, mood, at: new Date().toISOString() });
  // Keep a bounded history
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}

export function readMoods(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MoodEntry[];
  } catch {
    return [];
  }
}

export function getMoodForInsight(insightId: string): MoodSnap | null {
  return readMoods().find((m) => m.insightId === insightId)?.mood ?? null;
}
