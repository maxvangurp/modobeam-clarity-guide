// Modobeam — emotional color tinting
// Each "moment" has a soft accent color used for chips, glows, and
// background gestures. Subtle by design — never loud.

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
