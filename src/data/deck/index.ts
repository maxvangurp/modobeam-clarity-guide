import { ACTION_CARDS } from "./action";
import { DIRECTION_CARDS } from "./direction";
import { EMOTION_CARDS } from "./emotion";
import { GROWTH_CARDS } from "./growth";
import { INNER_WORLD_CARDS } from "./innerWorld";
import { LIFE_PATTERNS_CARDS } from "./lifePatterns";
import { MICRO_CARDS } from "./micro";
import { MIND_CARDS } from "./mind";
import { RELATIONSHIP_CARDS } from "./relationships";
import { RELATIONSHIP_CORE_CARDS } from "./relationshipsCore";
import { SHADOW_CARDS } from "./shadow";
import type { OracleCard } from "./types";

export type { CardCategory, OracleCard } from "./types";

// Main deck — the full library used by deeper readings.
// Micro cards are intentionally kept *out* of the main deck so they
// don't surface in 3-card / 4-card / 5-card spreads (which need depth).
// They power the daily / quick check-in flows separately.
export const DECK: OracleCard[] = [
  ...MIND_CARDS,
  ...EMOTION_CARDS,
  ...ACTION_CARDS,
  ...LIFE_PATTERNS_CARDS,
  ...RELATIONSHIP_CARDS,
  ...RELATIONSHIP_CORE_CARDS,
  ...DIRECTION_CARDS,
  ...GROWTH_CARDS,
  ...INNER_WORLD_CARDS,
  ...SHADOW_CARDS,
];

export const RELATIONSHIP_DECK: OracleCard[] = RELATIONSHIP_CORE_CARDS;

export const DIRECTION_DECK: OracleCard[] = DIRECTION_CARDS;

export const SHADOW_DECK: OracleCard[] = SHADOW_CARDS;

export const MICRO_DECK: OracleCard[] = MICRO_CARDS;

export function drawCards(count: number): OracleCard[] {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function drawRelationshipCards(count: number): OracleCard[] {
  const shuffled = [...RELATIONSHIP_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function drawDirectionCards(count: number): OracleCard[] {
  const shuffled = [...DIRECTION_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function drawShadowCards(count: number): OracleCard[] {
  const shuffled = [...SHADOW_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function drawMicroCards(count: number): OracleCard[] {
  const shuffled = [...MICRO_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCardById(id: string): OracleCard | undefined {
  return DECK.find((card) => card.id === id) ?? MICRO_DECK.find((card) => card.id === id);
}
