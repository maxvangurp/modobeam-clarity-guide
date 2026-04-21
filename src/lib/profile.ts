// Modobeam — local user profile (onboarding personalization)
// Stored locally; no auth required. Sent to AI for personalized reflections.

const KEY = "modobeam_profile_v1";
const COMPLETE_KEY = "modobeam_onboarding_complete_v1";

export type ClarityIntent =
  | "relationships"
  | "career"
  | "growth"
  | "rest"
  | "direction";

export type CurrentState =
  | "stuck"
  | "change"
  | "healing"
  | "uncertain"
  | "seeking-direction";

export type GuidanceStyle = "direct" | "calm" | "deep";

export interface UserProfile {
  intent?: ClarityIntent;
  state?: CurrentState;
  guidance?: GuidanceStyle;
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
export const INTENT_LABELS: Record<ClarityIntent, string> = {
  relationships: "Relationships",
  career: "Career",
  growth: "Personal growth",
  rest: "Mental rest",
  direction: "Direction in life",
};

export const STATE_LABELS: Record<CurrentState, string> = {
  stuck: "Feeling stuck",
  change: "Going through change",
  healing: "Healing from something",
  uncertain: "Feeling uncertain",
  "seeking-direction": "Looking for direction",
};

export const GUIDANCE_LABELS: Record<GuidanceStyle, string> = {
  direct: "Direct and honest",
  calm: "Calm and supportive",
  deep: "Deep and reflective",
};
