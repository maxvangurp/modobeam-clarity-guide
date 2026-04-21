// Modobeam — return-after-absence detection
// When someone comes back after a meaningful gap, the home screen should
// acknowledge the space rather than treat it like any other day.
//
// We track the last time the user *opened* the home screen so we can
// detect gaps even when they don't save a reflection.

const LAST_VISIT_KEY = "modobeam_last_home_visit_v1";

export interface ReturnContext {
  /** Days since the last home visit (rounded). null on first ever visit. */
  daysAway: number | null;
  /** True when ≥ 3 days have passed since last visit. */
  isReturning: boolean;
}

export function checkReturnAndStamp(): ReturnContext {
  const now = Date.now();
  const raw = localStorage.getItem(LAST_VISIT_KEY);
  let daysAway: number | null = null;
  if (raw) {
    const last = Number(raw);
    if (!Number.isNaN(last)) {
      daysAway = Math.floor((now - last) / (24 * 60 * 60 * 1000));
    }
  }
  // Stamp now — but only AFTER computing the gap above.
  localStorage.setItem(LAST_VISIT_KEY, String(now));
  return {
    daysAway,
    isReturning: daysAway !== null && daysAway >= 3,
  };
}
