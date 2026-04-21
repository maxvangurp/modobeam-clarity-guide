// Modobeam — weekly synthesis card
// Once a week (centered around Sunday evening, but available any time the
// user has at least 3 reflections in the last 7 days) we surface a single
// AI-written "your week in one breath" card on the home screen.
//
// Storage:
//   - We cache the most recent synthesis keyed by ISO week so the user
//     doesn't pay AI cost on every home visit.
//   - We track when it was last *dismissed* so it stays out of the way once
//     they've sat with it.

import type { InsightLite } from "@/lib/progression";

const CACHE_KEY = "modobeam_weekly_synthesis_v1";
const DISMISS_KEY = "modobeam_weekly_synthesis_dismissed_v1";

export interface WeeklySynthesis {
  /** ISO week id, e.g. "2026-W17" */
  weekId: string;
  /** Short core pattern line — e.g. "Letting go ↔ holding on" */
  corePattern: string;
  /** 2–3 themes lifted from the period */
  themes: string[];
  /** 3–4 sentences reflecting back the week */
  summary: string;
  /** ISO timestamp when generated */
  generatedAt: string;
}

function isoWeekId(d: Date = new Date()): string {
  // Standard ISO week: Thursday in same week determines the year.
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7; // Mon=1..Sun=7
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function getCurrentWeekId(): string {
  return isoWeekId();
}

export function readCachedSynthesis(): WeeklySynthesis | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WeeklySynthesis;
  } catch {
    return null;
  }
}

export function writeCachedSynthesis(s: WeeklySynthesis): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(s));
}

export function dismissWeeklySynthesis(weekId: string): void {
  localStorage.setItem(DISMISS_KEY, weekId);
}

function isDismissed(weekId: string): boolean {
  return localStorage.getItem(DISMISS_KEY) === weekId;
}

/**
 * Decide whether to surface the weekly synthesis on the home screen.
 *
 * Rules:
 * - At least 3 reflections in the last 7 days (otherwise there's nothing
 *   meaningful to synthesize — and we don't want this to feel forced).
 * - Today is Sunday OR Monday (the natural "looking back" days). On other
 *   days we still show a *cached* synthesis if one exists for this week.
 * - The user hasn't dismissed this week's card.
 */
export function shouldOfferWeeklySynthesis(
  insights: InsightLite[],
): { offer: boolean; weekId: string; recent: InsightLite[] } {
  const weekId = getCurrentWeekId();
  if (isDismissed(weekId)) return { offer: false, weekId, recent: [] };

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = insights.filter(
    (i) => new Date(i.created_at).getTime() >= sevenDaysAgo,
  );

  const today = new Date().getDay(); // 0 Sun … 6 Sat
  const weekendWindow = today === 0 || today === 1 || today === 6;

  // Need enough material to actually reflect back.
  if (recent.length < 3) return { offer: false, weekId, recent };

  // Outside the weekend window we still let a cached one show, but we don't
  // generate a fresh one (the caller will check cache).
  return { offer: weekendWindow, weekId, recent };
}
