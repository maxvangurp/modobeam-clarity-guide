// Modobeam — local user profile (onboarding personalization)
// Stored locally; no auth required. Sent to AI for personalized reflections.

const KEY = "modobeam_profile_v1";
const COMPLETE_KEY = "modobeam_onboarding_complete_v1";
const LAST_REVISIT_KEY = "modobeam_prefs_last_revisit_v1";
const NUDGE_DISMISSED_KEY = "modobeam_prefs_nudge_dismissed_v1";
const LAST_MOMENT_PROMPT_KEY = "modobeam_moment_last_prompt_v1";
const STREAK_KEY = "modobeam_streak_v1";

interface StreakState {
  count: number;
  lastDay: string; // YYYY-MM-DD (local)
}

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readStreak(): StreakState | null {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StreakState;
  } catch {
    return null;
  }
}

// Returns the current streak as the user would see it *today*.
// If their last save was before yesterday, the streak has lapsed → 0.
// Non-judgmental: a missed day just means the count rests at 0.
export function getStreak(): { count: number; savedToday: boolean } {
  const s = readStreak();
  if (!s) return { count: 0, savedToday: false };
  const today = todayKey();
  if (s.lastDay === today) return { count: s.count, savedToday: true };

  const yesterday = todayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (s.lastDay === yesterday) {
    // Still alive — they just haven't saved yet today
    return { count: s.count, savedToday: false };
  }
  // Lapsed — quietly reset to 0
  return { count: 0, savedToday: false };
}

// Call once per save (multiple saves the same day don't re-count).
// Returns the new streak so callers can show a soft confirmation.
export function recordReflectionSaved(): { count: number; isNewDay: boolean } {
  const today = todayKey();
  const s = readStreak();

  if (s?.lastDay === today) {
    return { count: s.count, isNewDay: false };
  }

  const yesterday = todayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const nextCount = s?.lastDay === yesterday ? s.count + 1 : 1;

  const next: StreakState = { count: nextCount, lastDay: today };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return { count: nextCount, isNewDay: true };
}

export type UsageMode =
  | "daily"
  | "on-mind"
  | "perspective"
  | "patterns";

export type LookingFor =
  | "clarity"
  | "calm"
  | "direction"
  | "perspective"
  | "pause";

export type GuidanceStyle = "direct" | "calm" | "deep";

export type Rhythm =
  | "daily"
  | "few-times-week"
  | "when-needed"
  | "figuring-out";

// Moment-based — per session, overrides baseline for one reading
export type MomentNeed =
  | "clarity"
  | "calm"
  | "uncertain"
  | "direction"
  | "reflect";

export interface UserProfile {
  usage?: UsageMode;
  lookingFor?: LookingFor;
  guidance?: GuidanceStyle;
  rhythm?: Rhythm;
  firstName?: string;
  birthday?: string; // ISO yyyy-mm-dd
  createdAt?: string;
  updatedAt?: string;
}

export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  const existing = getProfile() ?? {};
  const merged: UserProfile = {
    ...existing,
    ...profile,
    createdAt: existing.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
  // Any save counts as a fresh revisit — silence the nudge for a while
  markPreferencesRevisited();
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(COMPLETE_KEY);
  localStorage.removeItem(LAST_REVISIT_KEY);
  localStorage.removeItem(NUDGE_DISMISSED_KEY);
  localStorage.removeItem(STREAK_KEY);
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(COMPLETE_KEY) === "true";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(COMPLETE_KEY, "true");
  markPreferencesRevisited();
}

export function markPreferencesRevisited(): void {
  localStorage.setItem(LAST_REVISIT_KEY, new Date().toISOString());
  localStorage.removeItem(NUDGE_DISMISSED_KEY);
}

export function dismissPreferencesNudge(): void {
  localStorage.setItem(NUDGE_DISMISSED_KEY, new Date().toISOString());
}

// Show a quiet nudge if it's been > 21 days since they last touched prefs
// AND the nudge hasn't been dismissed in the last 14 days.
export function shouldShowPreferencesNudge(): boolean {
  if (!isOnboardingComplete()) return false;
  const last = localStorage.getItem(LAST_REVISIT_KEY);
  if (!last) return false;
  const daysSince =
    (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 21) return false;

  const dismissed = localStorage.getItem(NUDGE_DISMISSED_KEY);
  if (dismissed) {
    const daysSinceDismiss =
      (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDismiss < 14) return false;
  }
  return true;
}

// Track when the moment check-in was last shown so we can space it
// according to the user's rhythm preference.
export function markMomentPromptShown(): void {
  localStorage.setItem(LAST_MOMENT_PROMPT_KEY, new Date().toISOString());
}

// Decide whether to surface the moment check-in before a reading.
// Rhythm controls cadence:
//  - daily            → at most once per calendar day
//  - few-times-week   → at most once every ~2.5 days
//  - when-needed      → never auto-prompt (user can open it manually)
//  - figuring-out     → light cadence, ~once every 2 days
//  - undefined        → safe default: once per day
// Forced opens (user taps "Change" / "Set moment") bypass this and are
// handled by the caller — this function is only for the auto-prompt.
export function shouldPromptMoment(rhythm?: Rhythm): boolean {
  if (rhythm === "when-needed") return false;

  const last = localStorage.getItem(LAST_MOMENT_PROMPT_KEY);
  if (!last) return true;

  const hoursSince =
    (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);

  const minHours: Record<Rhythm, number> = {
    daily: 20,
    "few-times-week": 60,
    "when-needed": Number.POSITIVE_INFINITY,
    "figuring-out": 44,
  };
  const threshold = rhythm ? minHours[rhythm] : 20;
  return hoursSince >= threshold;
}
// Human-readable labels — used in UI and sent to AI as context
export const USAGE_LABELS: Record<UsageMode, string> = {
  daily: "As a daily check-in",
  "on-mind": "To reflect when something is on my mind",
  perspective: "To slow down and get perspective",
  patterns: "To notice patterns over time",
};

export const LOOKING_FOR_LABELS: Record<LookingFor, string> = {
  clarity: "Clarity",
  calm: "Calm",
  direction: "Direction",
  perspective: "Perspective",
  pause: "A moment to pause",
};

export const GUIDANCE_LABELS: Record<GuidanceStyle, string> = {
  direct: "Direct and honest",
  calm: "Calm and supportive",
  deep: "Deep and reflective",
};

export const RHYTHM_LABELS: Record<Rhythm, string> = {
  daily: "Daily",
  "few-times-week": "A few times a week",
  "when-needed": "Whenever I need it",
  "figuring-out": "I'm still figuring that out",
};

export const MOMENT_LABELS: Record<MomentNeed, string> = {
  clarity: "I want clarity",
  calm: "I need calm",
  uncertain: "I feel uncertain",
  direction: "I want direction",
  reflect: "I just want to reflect",
};

// Map a moment to AI guidance shaping
export const MOMENT_TONE: Record<MomentNeed, string> = {
  clarity:
    "They want clarity right now — be precise and grounded. Cut to what matters.",
  calm:
    "They need calm right now — slow the pacing, soften the edges, leave space.",
  uncertain:
    "They feel uncertain right now — don't add more weight. Acknowledge ambiguity gently and offer one thing to hold onto.",
  direction:
    "They want direction right now — name what's actually pulling them, and what the honest next thing might be.",
  reflect:
    "They just want to reflect — stay observational, low-pressure, no push.",
};
