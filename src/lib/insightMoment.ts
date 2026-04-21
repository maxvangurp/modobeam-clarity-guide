// Modobeam — per-insight moment memory
// The "moment" the user chose before drawing isn't stored on the insight row
// (the schema is read-only), so we keep a small local map keyed by insight id.
// Used to tint the Insight screen with the emotional context of that moment.

import type { MomentNeed } from "@/lib/profile";
import { MOMENT_LABELS } from "@/lib/profile";

const KEY = "modobeam_insight_moment_v1";
// Cap how many we remember to keep storage tiny.
const MAX_ENTRIES = 80;

type Map = Record<string, MomentNeed>;

function read(): Map {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Map;
  } catch {
    return {};
  }
}

function isMoment(v: string): v is MomentNeed {
  return v in MOMENT_LABELS;
}

export function setInsightMoment(
  insightId: string,
  moment: MomentNeed | null,
): void {
  if (!moment) return;
  const map = read();
  map[insightId] = moment;
  // Trim oldest entries if oversized
  const keys = Object.keys(map);
  if (keys.length > MAX_ENTRIES) {
    const trimmed: Map = {};
    keys.slice(-MAX_ENTRIES).forEach((k) => {
      trimmed[k] = map[k];
    });
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getInsightMoment(insightId: string): MomentNeed | null {
  const v = read()[insightId];
  if (v && isMoment(v)) return v;
  return null;
}
