import { Sparkles, Layers, Compass, Heart, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DrawType = "daily" | "three" | "next-phase" | "direction" | "love" | "year";

export interface ReadingType {
  id: DrawType;
  label: string;
  subtitle: string;
  description: string;
  cardCount: number;
  positionLabels: string[];
  icon: LucideIcon;
  featured?: boolean;
  // How many saved reflections before this surfaces in the UI.
  // Defined centrally in src/lib/progression.ts (UNLOCK_THRESHOLDS).
}

export const READING_TYPES: ReadingType[] = [
  {
    id: "daily",
    label: "Daily clarity",
    subtitle: "One card · one focus",
    description: "A single card to ground your day.",
    cardCount: 1,
    positionLabels: ["Today"],
    icon: Sparkles,
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
    featured: true,
  },
  {
    id: "direction",
    label: "Direction",
    subtitle: "When you feel stuck",
    description: "Understand where you are, what's holding you, and what wants to move.",
    cardCount: 4,
    positionLabels: ["Where you are", "What keeps you stuck", "What wants to change", "Next step"],
    icon: Compass,
  },
  {
    id: "love",
    label: "Love & emotion",
    subtitle: "Relationships · attachment",
    description: "Reflect on what you feel, what you hold, and what you need to see.",
    cardCount: 4,
    positionLabels: ["What you feel", "What you hold onto", "What you need to see", "What helps you move forward"],
    icon: Heart,
  },
  {
    id: "next-phase",
    label: "Next phase",
    subtitle: "What's ending · what's emerging",
    description: "A deeper reading to understand the phase you're entering.",
    cardCount: 5,
    positionLabels: ["What is ending", "What is emerging", "What challenges you", "What supports you", "Your direction"],
    icon: RotateCcw,
  },
  {
    id: "year",
    label: "Year reflection",
    subtitle: "Your current trajectory",
    description: "A high-level view of your main theme, tension, growth area, and focus.",
    cardCount: 4,
    positionLabels: ["Main theme", "Inner tension", "Growth area", "Focus point"],
    icon: Layers,
  },
];

export function getReadingType(id: string): ReadingType | undefined {
  return READING_TYPES.find((r) => r.id === id);
}
