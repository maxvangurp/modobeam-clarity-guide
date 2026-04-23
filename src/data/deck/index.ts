import { ACTION_CARDS } from "./action";
import { EMOTION_CARDS } from "./emotion";
import { GROWTH_CARDS } from "./growth";
import { INNER_WORLD_CARDS } from "./innerWorld";
import { LIFE_PATTERNS_CARDS } from "./lifePatterns";
import { MIND_CARDS } from "./mind";
import { RELATIONSHIP_CARDS } from "./relationships";
import type { OracleCard } from "./types";

export type { CardCategory, OracleCard } from "./types";

export const DECK: OracleCard[] = [
  ...MIND_CARDS,
  ...EMOTION_CARDS,
  ...ACTION_CARDS,
  ...LIFE_PATTERNS_CARDS,
  ...RELATIONSHIP_CARDS,
  ...GROWTH_CARDS,
  ...INNER_WORLD_CARDS,
];

export function drawCards(count: number): OracleCard[] {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCardById(id: string): OracleCard | undefined {
  return DECK.find((card) => card.id === id);
}
