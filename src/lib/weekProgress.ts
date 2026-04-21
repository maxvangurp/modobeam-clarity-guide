// Modobeam — soft weekly progress
// Returns 7 day-cells (oldest → today) marking which days had a saved
// reflection. Used for the calm "days filled" strip on the home screen.
// Non-judgmental: empty days are just empty, never "missed".

import type { InsightLite } from "@/lib/progression";

export interface DayCell {
  /** YYYY-MM-DD (local) */
  key: string;
  /** Single letter weekday label (M, T, W…) */
  label: string;
  /** Has at least one saved reflection that day */
  filled: boolean;
  /** Is this the user's today */
  isToday: boolean;
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"];

export function buildWeek(insights: InsightLite[]): DayCell[] {
  const filledDays = new Set<string>();
  for (const i of insights) {
    filledDays.add(dayKey(new Date(i.created_at)));
  }
  const today = new Date();
  const todayK = dayKey(today);
  const cells: DayCell[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = dayKey(d);
    cells.push({
      key: k,
      label: WEEKDAY_LETTER[d.getDay()],
      filled: filledDays.has(k),
      isToday: k === todayK,
    });
  }
  return cells;
}
