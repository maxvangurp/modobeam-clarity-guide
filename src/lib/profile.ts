// Modobeam — local user profile (onboarding personalization)
// Stored locally; no auth required. Sent to AI for personalized reflections.

const KEY = "modobeam_profile_v1";
const COMPLETE_KEY = "modobeam_onboarding_complete_v1";

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

export interface UserProfile {
  usage?: UsageMode;
  lookingFor?: LookingFor;
  guidance?: GuidanceStyle;
  rhythm?: Rhythm;
  firstName?: string;
  birthday?: string; // ISO yyyy-mm-dd
  createdAt?: string;
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
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(COMPLETE_KEY);
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(COMPLETE_KEY) === "true";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(COMPLETE_KEY, "true");
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
