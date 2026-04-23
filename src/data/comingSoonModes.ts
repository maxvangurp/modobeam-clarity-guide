// Modobeam — coming-soon reading modes
//
// These show up as styled previews in the Readings library and the
// home Explore carousel so the user feels the depth that's coming,
// without us shipping shallow placeholder flows. They are NOT clickable
// into a real /draw/:type — we surface a quiet "Coming soon" affordance
// instead.
//
// When one of these graduates to a real reading, move it into
// `src/data/readingTypes.ts` and remove the entry here.

import {
  HelpCircle,
  Scale,
  Eye,
  Activity,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import type { CardCategory } from "@/data/deck";

export interface ComingSoonMode {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  /** Approximate card count, for the depth indicator chip */
  cardCount: number;
  icon: LucideIcon;
  /** Drives the accent tint via getCategoryAccent() */
  category: CardCategory;
  /** Where it lives in the Readings library grouping */
  group: "quick" | "deeper" | "lens";
}

export const COMING_SOON_MODES: ComingSoonMode[] = [
  {
    id: "energy-check",
    label: "Energy check",
    subtitle: "Where you are right now",
    description: "A one-card scan of how you're actually showing up today.",
    cardCount: 1,
    icon: Activity,
    category: "Action",
    group: "quick",
  },
  {
    id: "ask-for-friend",
    label: "Ask for a friend",
    subtitle: "Reflect on someone close",
    description: "A softer way in — explore a situation through someone else's lens.",
    cardCount: 3,
    icon: HelpCircle,
    category: "Relationships",
    group: "lens",
  },
  {
    id: "this-or-that",
    label: "This or that",
    subtitle: "Two paths · one choice",
    description: "Hold two options up to the light and notice what each one asks of you.",
    cardCount: 2,
    icon: Scale,
    category: "Mind",
    group: "lens",
  },
  {
    id: "whats-going-on",
    label: "What's really going on?",
    subtitle: "Underneath the surface",
    description: "A deeper read for when something's stirring but you can't quite name it.",
    cardCount: 4,
    icon: Eye,
    category: "Life Patterns",
    group: "deeper",
  },
  {
    id: "pattern-breaker",
    label: "Pattern breaker",
    subtitle: "When you keep circling",
    description: "Name the loop. Name the move. A small shift you can actually try.",
    cardCount: 3,
    icon: Repeat,
    category: "Action",
    group: "deeper",
  },
];

export function getComingSoonMode(id: string): ComingSoonMode | undefined {
  return COMING_SOON_MODES.find((m) => m.id === id);
}
