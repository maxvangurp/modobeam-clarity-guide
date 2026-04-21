// Card artwork imports — full printed-style cards.
// Complete card designs (gradient + symbol + title + reflection + category label baked in).
// Cards without artwork fall back to the rendered placeholder design.

import clarity from "@/assets/cards/clarity.jpg";
import doubt from "@/assets/cards/doubt.jpg";
import overthinking from "@/assets/cards/overthinking.jpg";
import perspective from "@/assets/cards/perspective.jpg";
import truth from "@/assets/cards/truth.jpg";
import control from "@/assets/cards/control.jpg";

import love from "@/assets/cards/love.jpg";
import attachment from "@/assets/cards/attachment.jpg";
import lettingGo from "@/assets/cards/letting-go.jpg";
import healing from "@/assets/cards/healing.jpg";
import longing from "@/assets/cards/longing.jpg";
import acceptance from "@/assets/cards/acceptance.jpg";

import focus from "@/assets/cards/focus.jpg";
import growth from "@/assets/cards/growth.jpg";
import change from "@/assets/cards/change.jpg";
import patience from "@/assets/cards/patience.jpg";
import boundaries from "@/assets/cards/boundaries.jpg";
import discipline from "@/assets/cards/discipline.jpg";

import timing from "@/assets/cards/timing.jpg";
import alignment from "@/assets/cards/alignment.jpg";
import selfWorth from "@/assets/cards/self-worth.jpg";
import release from "@/assets/cards/release.jpg";
import returnCard from "@/assets/cards/return.jpg";
import direction from "@/assets/cards/direction.jpg";

export const CARD_ART: Record<string, string> = {
  // Mind
  clarity,
  doubt,
  overthinking,
  perspective,
  truth,
  control,
  // Emotion
  love,
  attachment,
  "letting-go": lettingGo,
  healing,
  longing,
  acceptance,
  // Action
  focus,
  growth,
  change,
  patience,
  boundaries,
  discipline,
  // Life Patterns
  timing,
  alignment,
  "self-worth": selfWorth,
  release,
  return: returnCard,
  direction,
};

export function getCardArt(id: string): string | undefined {
  return CARD_ART[id];
}
