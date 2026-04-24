import type { CardCategory, OracleCard } from "@/data/deck";
import type { ReadingType } from "@/data/readingTypes";

export type ReflectionMode = "write" | "quick" | "voice";

interface QuickChoiceRule {
  matches: RegExp[];
  options: string[];
  allowMultiple: boolean;
}

export interface QuickChoiceSet {
  options: string[];
  allowMultiple: boolean;
  helper: string;
}

interface QuickChoiceContext {
  prompt?: string;
  cards: Pick<OracleCard, "name" | "keyword" | "category">[];
  reading?: Pick<ReadingType, "id" | "label"> | null;
}

const CATEGORY_FALLBACKS: Record<CardCategory, string[]> = {
  Mind: [
    "A clearer answer",
    "A truth I've delayed",
    "A decision",
    "More perspective",
    "Less mental noise",
    "I need a minute",
  ],
  Emotion: [
    "A version of the past",
    "A connection",
    "Something tender",
    "A hope",
    "Something I've outgrown",
    "I'm not sure yet",
  ],
  Action: [
    "One clear step",
    "A harder conversation",
    "Rest first",
    "A better boundary",
    "Less pressure",
    "I need more time",
  ],
  "Life Patterns": [
    "An old pattern",
    "A bigger theme",
    "What keeps repeating",
    "What wants to shift",
    "The season I'm in",
    "I'm still finding it",
  ],
  Relationships: [
    "A conversation that matters",
    "More mutuality",
    "A clearer boundary",
    "Something unspoken",
    "A softer connection",
    "I'm still figuring it out",
  ],
  Direction: [
    "A clearer next step",
    "More confidence in my path",
    "Permission to change direction",
    "Less pressure to have it figured out",
    "A truer sense of purpose",
    "I'm still finding my way",
  ],
  Growth: [
    "More self-trust",
    "The next version of me",
    "A braver choice",
    "A truer standard",
    "Room to grow differently",
    "I'm still becoming",
  ],
  "Inner World": [
    "A quieter truth",
    "What I'm actually feeling",
    "More inner steadiness",
    "Space to listen inward",
    "A deeper breath",
    "I need to sit with it",
  ],
  Shadow: [
    "A pattern I keep repeating",
    "Something I've been avoiding",
    "An old wound asking to be seen",
    "A part of me I've been hiding",
    "A truer sentence about myself",
    "I'm not ready to name it yet",
  ],
  Micro: [
    "Just checking in",
    "Naming what I feel",
    "A small reset",
    "I'm noticing more than I'm fixing",
    "A breath, then continue",
    "I don't need words today",
  ],
};

const QUICK_CHOICE_RULES: QuickChoiceRule[] = [
  {
    matches: [/keep alive/i, /already changed/i, /let(ting)? go/i, /release/i],
    allowMultiple: true,
    options: [
      "A version of the past",
      "A connection",
      "A routine",
      "A hope",
      "Something I've outgrown",
      "I'm not sure yet",
    ],
  },
  {
    matches: [/already know/i, /true here/i, /pretending/i, /honest/i, /truth/i],
    allowMultiple: true,
    options: [
      "The simplest answer",
      "A boundary",
      "A feeling I avoid",
      "A decision I've delayed",
      "What I already know",
      "I'm not ready to name it",
    ],
  },
  {
    matches: [/next step/i, /move forward/i, /direction/i, /small(est)? action/i, /what would i do/i],
    allowMultiple: false,
    options: [
      "One clear step",
      "A hard conversation",
      "Rest first",
      "Let something end",
      "Trust myself more",
      "Wait and watch",
    ],
  },
  {
    matches: [/longing/i, /want/i, /chosen/i, /seen/i, /love/i],
    allowMultiple: true,
    options: [
      "A deeper connection",
      "More ease",
      "Something more honest",
      "Room to breathe",
      "To feel chosen less by effort",
      "I'm still finding it",
    ],
  },
  {
    matches: [/change/i, /ending/i, /emerging/i, /shift/i, /phase/i],
    allowMultiple: true,
    options: [
      "An old identity",
      "A pattern",
      "A relationship dynamic",
      "Control",
      "Unfinished grief",
      "I can't tell yet",
    ],
  },
  {
    matches: [/care right now/i, /tenderness/i, /healing/i, /what part of me/i],
    allowMultiple: true,
    options: [
      "More softness",
      "Rest",
      "Reassurance",
      "Space to feel",
      "A gentler pace",
      "I don't know yet",
    ],
  },
];

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values)).slice(0, 6);
}

function pickDominantCategory(
  cards: Pick<OracleCard, "category">[],
): CardCategory {
  const counts = new Map<CardCategory, number>();
  cards.forEach((card) => {
    counts.set(card.category, (counts.get(card.category) ?? 0) + 1);
  });

  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mind"
  );
}

export function buildQuickChoiceSet({
  prompt,
  cards,
  reading,
}: QuickChoiceContext): QuickChoiceSet {
  const matchedRule = QUICK_CHOICE_RULES.find((rule) =>
    rule.matches.some((pattern) => pattern.test(prompt ?? "")),
  );

  const fallback = CATEGORY_FALLBACKS[pickDominantCategory(cards)];
  const readingSpecific =
    reading?.id === "daily"
      ? [
          "What's most present",
          "A choice ahead",
          "A feeling under it",
          "Something to release",
          "What needs clarity",
          "I'm just checking in",
        ]
      : fallback;

  const options = dedupe(matchedRule?.options ?? readingSpecific);
  const allowMultiple = matchedRule?.allowMultiple ?? true;

  return {
    options,
    allowMultiple,
    helper: allowMultiple
      ? "Choose what feels closest. You can pick more than one."
      : "Choose the one response that feels closest right now.",
  };
}

export function composeQuickReflection(
  prompt: string | undefined,
  selections: string[],
  note: string,
): string {
  const parts = [
    prompt ? `Prompt: ${prompt}` : "",
    selections.length ? `What resonated: ${selections.join("; ")}` : "",
    note.trim() ? `A few words: ${note.trim()}` : "",
  ].filter(Boolean);

  return parts.join("\n\n").trim();
}