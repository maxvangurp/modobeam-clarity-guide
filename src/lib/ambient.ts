// Modobeam — ambient background math
// Returns the slow-drifting tint to layer underneath the app, blended from
// the time of day and (optionally) the user's chosen moment.
// Intent: imperceptible per-second, unmistakable across a session.

import type { MomentNeed } from "@/lib/profile";
import { MOMENT_TINTS } from "@/lib/momentTint";

export interface AmbientLayer {
  /** HSL string like "211 60% 70%" */
  hsl: string;
  /** 0–1 intensity used as alpha multiplier */
  intensity: number;
  /** Soft secondary accent for cross-fade */
  accent: string;
}

// Time-of-day → ambient tint
// Morning: warm sand. Midday: soft sky. Evening: dusty indigo. Night: deep blue.
function timeOfDayTint(d = new Date()): { hsl: string; accent: string } {
  const h = d.getHours();
  if (h >= 5 && h < 10) return { hsl: "32 55% 78%", accent: "211 50% 88%" };
  if (h >= 10 && h < 16) return { hsl: "211 55% 86%", accent: "180 40% 88%" };
  if (h >= 16 && h < 20) return { hsl: "25 45% 72%", accent: "270 30% 80%" };
  if (h >= 20 && h < 23) return { hsl: "240 35% 60%", accent: "270 30% 50%" };
  return { hsl: "230 35% 28%", accent: "211 30% 22%" };
}

export function getAmbientLayer(
  moment: MomentNeed | null,
  d = new Date(),
): AmbientLayer {
  const tod = timeOfDayTint(d);
  if (moment) {
    const m = MOMENT_TINTS[moment];
    // Blend: moment leads, time-of-day shapes the secondary accent
    return { hsl: m.hsl, intensity: 0.55, accent: tod.hsl };
  }
  return { hsl: tod.hsl, intensity: 0.45, accent: tod.accent };
}
