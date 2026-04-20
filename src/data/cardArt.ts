// Card artwork imports — full printed-style cards for the first batch.
// These are the complete card designs (gradient + symbol + title + reflection + category label baked in).
// Cards without artwork fall back to the rendered placeholder design.

import clarity from "@/assets/cards/clarity.jpg";
import doubt from "@/assets/cards/doubt.jpg";
import lettingGo from "@/assets/cards/letting-go.jpg";
import alignment from "@/assets/cards/alignment.jpg";
import focus from "@/assets/cards/focus.jpg";
import direction from "@/assets/cards/direction.jpg";

export const CARD_ART: Record<string, string> = {
  clarity,
  doubt,
  "letting-go": lettingGo,
  alignment,
  focus,
  direction,
};

export function getCardArt(id: string): string | undefined {
  return CARD_ART[id];
}
