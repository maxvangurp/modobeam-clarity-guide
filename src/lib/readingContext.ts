// Modobeam — reading context
//
// Some readings ask the user a small extra question before the draw
// (who is this about / which timeframe / which two paths / which
// milestone). This file holds the typed shape of that context and
// helpers to ferry it between Draw and Reading via sessionStorage so
// we don't pollute URLs with everything.
//
// The context is also persisted briefly so Insight pages can quote it
// back ("a reading about Maya · close friend").

import type { Person } from "./people";

export type HorizonRange = "3-months" | "1-year" | "3-years" | "5-years";

export const HORIZON_LABELS: Record<HorizonRange, string> = {
  "3-months": "Next 3 months",
  "1-year": "Next year",
  "3-years": "Next 3 years",
  "5-years": "Next 5 years",
};

export const HORIZON_TONES: Record<HorizonRange, string> = {
  "3-months":
    "Near-term: practical and grounded. What's already in motion. Real, not abstract.",
  "1-year":
    "Mid-term: a shape forming. Themes more than events. What this year is asking of them.",
  "3-years":
    "Longer arc: identity and direction. Patterns rather than predictions.",
  "5-years":
    "Long horizon: trajectory and life-shape. Stay reflective, never predictive.",
};

export type RelationshipStatus =
  | "couple"
  | "dating"
  | "ex"
  | "undefined"
  | "complicated";

export const RELATIONSHIP_STATUS_LABELS: Record<RelationshipStatus, string> = {
  couple: "Couple",
  dating: "Dating",
  ex: "Ex",
  undefined: "Undefined",
  complicated: "Complicated",
};

export type MilestoneKind =
  | "new-job"
  | "moving"
  | "birthday"
  | "new-year"
  | "breakup"
  | "travel"
  | "decision"
  | "loss"
  | "other";

export const MILESTONE_LABELS: Record<MilestoneKind, string> = {
  "new-job": "Starting a new job",
  moving: "Moving",
  birthday: "Birthday",
  "new-year": "New year",
  breakup: "Breakup",
  travel: "Travel",
  decision: "Big decision",
  loss: "A loss",
  other: "Another threshold",
};

export interface FriendContext {
  kind: "friend";
  personName: string;
  personRelation: string;
  personId?: string;
  topic?: string;
}

export interface ThisOrThatContext {
  kind: "this-or-that";
  optionA: string;
  optionB: string;
  question?: string;
}

export interface HorizonContext {
  kind: "horizon";
  range: HorizonRange;
  area?: string;
}

export interface RelationshipFutureContext {
  kind: "relationship-future";
  personName: string;
  personRelation: string;
  personId?: string;
  status: RelationshipStatus;
}

export interface MilestoneContext {
  kind: "milestone";
  milestone: MilestoneKind;
  note?: string;
}

export type ReadingContext =
  | FriendContext
  | ThisOrThatContext
  | HorizonContext
  | RelationshipFutureContext
  | MilestoneContext;

const KEY_PREFIX = "modobeam_reading_ctx_v1:";

/** Stash context against the about-to-be-saved insight. */
export function stashContext(scopeKey: string, ctx: ReadingContext): void {
  try {
    sessionStorage.setItem(KEY_PREFIX + scopeKey, JSON.stringify(ctx));
  } catch {
    // ignore quota errors — context is best-effort
  }
}

export function readContext(scopeKey: string): ReadingContext | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + scopeKey);
    if (!raw) return null;
    return JSON.parse(raw) as ReadingContext;
  } catch {
    return null;
  }
}

export function clearContext(scopeKey: string): void {
  sessionStorage.removeItem(KEY_PREFIX + scopeKey);
}

/** Build a one-line, human label for a context — for chips on Insight. */
export function describeContext(ctx: ReadingContext | null | undefined): string | null {
  if (!ctx) return null;
  switch (ctx.kind) {
    case "friend":
      return `About ${ctx.personName}${ctx.personRelation ? ` · ${ctx.personRelation}` : ""}${ctx.topic ? ` — ${ctx.topic}` : ""}`;
    case "this-or-that":
      return `${ctx.optionA}  ·  ${ctx.optionB}`;
    case "horizon":
      return HORIZON_LABELS[ctx.range];
    case "relationship-future":
      return `${ctx.personName} · ${RELATIONSHIP_STATUS_LABELS[ctx.status]}`;
    case "milestone":
      return MILESTONE_LABELS[ctx.milestone];
  }
}

export function personFromContext(ctx: ReadingContext | null): Pick<Person, "name" | "relation"> | null {
  if (!ctx) return null;
  if (ctx.kind === "friend" || ctx.kind === "relationship-future") {
    return { name: ctx.personName, relation: ctx.personRelation as Person["relation"] };
  }
  return null;
}
