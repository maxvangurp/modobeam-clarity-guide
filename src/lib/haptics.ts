// Modobeam — soft haptics
// Tiny wrapper around the Web Vibration API. We keep durations very short
// and patterns gentle — haptics here exist to add a tactile "felt" quality,
// not to demand attention. All calls are no-ops on devices/browsers that
// don't support vibration, and respect the user's reduced-motion preference.

type Tap =
  | "select"  // light tap — moment chip, small toggle
  | "flip"    // medium — card reveal
  | "save"    // success — saved reflection
  | "warm";   // soft confirmation — completing a moment

const PATTERNS: Record<Tap, number | number[]> = {
  select: 8,
  flip: [8, 28, 12],
  save: [10, 30, 14, 30, 18],
  warm: 18,
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function haptic(kind: Tap): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  if (prefersReducedMotion()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    // some browsers throw if called from a non-user gesture; fail quietly
  }
}
