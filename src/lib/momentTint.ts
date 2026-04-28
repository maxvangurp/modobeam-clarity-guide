// Modobeam — emotional color tinting + canonical moment ordering
//
// Each "moment" has a soft accent color used for chips, glows, and
// background gestures. Subtle by design — never loud.
//
// This file is also the single source of truth for:
//  - the order moments are presented in the UI
//  - their short chip label
//  - the matching surface tone class

import type { MomentNeed } from "@/lib/profile";

export interface MomentTint {
  /** HSL string like "211 60% 70%" — pair with text-[hsl(...)] / opacity */
  hsl: string;
  /** A label color for tinted chips */
  ring: string;
  /** Soft background tint (use with /20, /30 alpha) */
  bg: string;
}

export const MOMENT_TINTS: Record<MomentNeed, MomentTint> = {
  // Clarity → soft blue
  clarity: {
    hsl: "211 70% 65%",
    ring: "211 60% 55%",
    bg: "211 70% 88%",
  },
  // Calm → blue/green
  calm: {
    hsl: "180 35% 60%",
    ring: "180 30% 48%",
    bg: "180 40% 88%",
  },
  // Direction → indigo
  direction: {
    hsl: "240 45% 65%",
    ring: "240 40% 55%",
    bg: "240 50% 90%",
  },
  // Uncertainty → muted purple/gray
  uncertain: {
    hsl: "270 18% 60%",
    ring: "270 15% 50%",
    bg: "270 20% 88%",
  },
  // Reflect → warm neutral
  reflect: {
    hsl: "35 30% 65%",
    ring: "35 25% 55%",
    bg: "35 35% 90%",
  },
};

export function getMomentTint(moment: MomentNeed | null): MomentTint | null {
  if (!moment) return null;
  return MOMENT_TINTS[moment];
}

/** Canonical UI ordering for the five moment chips. */
export const MOMENT_ORDER: MomentNeed[] = [
  "clarity",
  "calm",
  "direction",
  "uncertain",
  "reflect",
];

/** Short, single-word chip labels — used wherever space is tight. */
export const MOMENT_CHIP: Record<MomentNeed, string> = {
  clarity: "Clarity",
  calm: "Calm",
  direction: "Direction",
  uncertain: "Uncertainty",
  reflect: "Just reflecting",
};

/** Tone surface utility class — paired with the chosen moment. */
export const MOMENT_SURFACE: Record<MomentNeed, string> = {
  clarity: "bg-tone-clarity",
  calm: "bg-tone-calm",
  direction: "bg-tone-direction",
  uncertain: "bg-tone-uncertain",
  reflect: "bg-tone-reflect",
};
