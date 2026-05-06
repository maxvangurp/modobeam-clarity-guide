import {
  Sparkles,
  Layers,
  Compass,
  Heart,
  RotateCcw,
  Users,
  GitBranch,
  Telescope,
  HeartHandshake,
  Flag,
  UsersRound,
  UserSquare2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CardCategory } from "@/data/deck";

export type DrawType =
  | "daily"
  | "three"
  | "next-phase"
  | "direction"
  | "love"
  | "year"
  | "friend"
  | "this-or-that"
  | "horizon"
  | "relationship-future"
  | "milestone"
  | "duo"
  | "group";

/** Where a mode lives in the Readings library / home */
export type ReadingGroup =
  | "quick"
  | "deeper"
  | "together"
  | "horizon"
  | "moments";

export interface ReadingType {
  id: DrawType;
  label: string;
  subtitle: string;
  description: string;
  cardCount: number;
  positionLabels: string[];
  icon: LucideIcon;
  /** Drives the accent color in preview cards */
  category: CardCategory;
  group: ReadingGroup;
  featured?: boolean;
  /** True when the user must pass a small input step before drawing */
  needsContext?: boolean;
}

export const READING_TYPES: ReadingType[] = [
  // ─── Quick ────────────────────────────────────────────────
  {
    id: "daily",
    label: "Daily clarity",
    subtitle: "One card · one focus",
    description: "A single card to ground your day.",
    cardCount: 1,
    positionLabels: ["Today"],
    icon: Sparkles,
    category: "Mind",
    group: "quick",
    featured: true,
  },
  {
    id: "three",
    label: "3-card insight",
    subtitle: "Past · present · direction",
    description: "See what's behind you, where you are, and what's emerging.",
    cardCount: 3,
    positionLabels: ["Past influence", "Present focus", "Emerging"],
    icon: Layers,
    category: "Life Patterns",
    group: "quick",
    featured: true,
  },
  {
    id: "this-or-that",
    label: "This or that",
    subtitle: "Two paths · one choice",
    description:
      "Hold two options up to the light. Notice the shape of each one.",
    cardCount: 3,
    positionLabels: ["Path A", "Path B", "What sits underneath"],
    icon: GitBranch,
    category: "Mind",
    group: "quick",
    needsContext: true,
  },

  // ─── Deeper ───────────────────────────────────────────────
  {
    id: "direction",
    label: "Direction",
    subtitle: "When you feel stuck",
    description:
      "Understand where you are, what's holding you, and what wants to move.",
    cardCount: 4,
    positionLabels: [
      "Where you are",
      "What keeps you stuck",
      "What wants to change",
      "Next step",
    ],
    icon: Compass,
    category: "Direction",
    group: "deeper",
  },
  {
    id: "love",
    label: "Love & emotion",
    subtitle: "Relationships · attachment",
    description:
      "Reflect on what you feel, what you hold, and what you need to see.",
    cardCount: 4,
    positionLabels: [
      "What you feel",
      "What you hold onto",
      "What you need to see",
      "What helps you move forward",
    ],
    icon: Heart,
    category: "Emotion",
    group: "deeper",
  },
  {
    id: "next-phase",
    label: "Next phase",
    subtitle: "What's ending · what's emerging",
    description: "A deeper reading to understand the phase you're entering.",
    cardCount: 5,
    positionLabels: [
      "What is ending",
      "What is emerging",
      "What challenges you",
      "What supports you",
      "Your direction",
    ],
    icon: RotateCcw,
    category: "Life Patterns",
    group: "deeper",
  },
  {
    id: "year",
    label: "Year reflection",
    subtitle: "Your current trajectory",
    description:
      "A high-level view of your main theme, tension, growth area, and focus.",
    cardCount: 4,
    positionLabels: [
      "Main theme",
      "Inner tension",
      "Growth area",
      "Focus point",
    ],
    icon: Layers,
    category: "Life Patterns",
    group: "deeper",
  },

  // ─── Together ─────────────────────────────────────────────
  {
    id: "friend",
    label: "Ask for a friend",
    subtitle: "A reading about someone close",
    description:
      "Reflect on a friend, partner, or someone on your mind. The card speaks through your lens of them.",
    cardCount: 3,
    positionLabels: [
      "What they're carrying",
      "What may be unseen",
      "What might help",
    ],
    icon: Users,
    category: "Relationships",
    group: "together",
    needsContext: true,
  },
  {
    id: "relationship-future",
    label: "Relationship future",
    subtitle: "Where this connection is heading",
    description:
      "A 5-card lens on a specific bond — current dynamic, hidden issue, what holds, what hurts, where it points.",
    cardCount: 5,
    positionLabels: [
      "Current dynamic",
      "Hidden issue",
      "What strengthens this",
      "What weakens this",
      "Where this is heading",
    ],
    icon: HeartHandshake,
    category: "Relationships",
    group: "together",
    needsContext: true,
  },

  // ─── Horizon ──────────────────────────────────────────────
  {
    id: "horizon",
    label: "Horizon",
    subtitle: "3 months · 1 year · 3 years · 5 years",
    description:
      "A future-facing reflection. Not prediction — the shape of what's forming.",
    cardCount: 5,
    positionLabels: [
      "Where you are now",
      "What is forming",
      "What will challenge you",
      "What supports you",
      "What this may lead toward",
    ],
    icon: Telescope,
    category: "Direction",
    group: "horizon",
    needsContext: true,
  },

  // ─── Moments ──────────────────────────────────────────────
  {
    id: "milestone",
    label: "Milestone",
    subtitle: "A reading for the moment itself",
    description:
      "A ritual reflection for a threshold — a move, a job, a birthday, a goodbye.",
    cardCount: 4,
    positionLabels: [
      "What you're leaving",
      "What you're entering",
      "What to honor",
      "What to carry forward",
    ],
    icon: Flag,
    category: "Life Patterns",
    group: "moments",
    needsContext: true,
  },
];

export function getReadingType(id: string): ReadingType | undefined {
  return READING_TYPES.find((r) => r.id === id);
}

export function readingsByGroup(group: ReadingGroup): ReadingType[] {
  return READING_TYPES.filter((r) => r.group === group);
}
