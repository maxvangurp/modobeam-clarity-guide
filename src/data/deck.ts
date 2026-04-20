export type CardCategory = "Mind" | "Emotion" | "Action";

export interface OracleCard {
  id: string;
  name: string;
  keyword: string;
  category: CardCategory;
  shortMeaning: string;
  deeperMeaning: string;
}

export const DECK: OracleCard[] = [
  {
    id: "clarity",
    name: "Clarity",
    keyword: "See clearly",
    category: "Mind",
    shortMeaning:
      "You already have more answers than you think. Slow down enough to hear them.",
    deeperMeaning:
      "Clarity invites the user to separate signal from noise. Encourage them to identify one true thing they already know to be right, and trust that as a starting point.",
  },
  {
    id: "focus",
    name: "Focus",
    keyword: "One thing",
    category: "Mind",
    shortMeaning:
      "Energy follows attention. Choose the one thing that matters most right now.",
    deeperMeaning:
      "Focus is about subtraction, not addition. Help the user identify what they can deliberately set down so they can give their best to one priority.",
  },
  {
    id: "trust",
    name: "Trust",
    keyword: "Quiet confidence",
    category: "Emotion",
    shortMeaning:
      "You don't need certainty to take the next step. Trust is built through small, honest actions.",
    deeperMeaning:
      "Trust speaks to safety — both in oneself and in the process. Invite the user to notice where they're rehearsing worst-case scenarios instead of moving.",
  },
  {
    id: "letting-go",
    name: "Letting Go",
    keyword: "Release",
    category: "Emotion",
    shortMeaning:
      "Some weight isn't yours to carry. Notice what you've been gripping and loosen your hold.",
    deeperMeaning:
      "Letting Go is not giving up — it's making space. Encourage reflection on what they're holding out of habit, fear, or identity rather than necessity.",
  },
  {
    id: "growth",
    name: "Growth",
    keyword: "Stretch",
    category: "Action",
    shortMeaning:
      "Discomfort isn't a sign you're off track. It's often the texture of becoming.",
    deeperMeaning:
      "Growth points to a threshold the user is approaching. Help them name what they'd attempt if they trusted themselves a little more.",
  },
  {
    id: "doubt",
    name: "Doubt",
    keyword: "Listen, don't obey",
    category: "Mind",
    shortMeaning:
      "Doubt is information, not a verdict. Question it the same way it questions you.",
    deeperMeaning:
      "Doubt asks the user to examine the source of their hesitation. Is it wisdom, or is it old protection? Encourage curiosity over judgment.",
  },
  {
    id: "balance",
    name: "Balance",
    keyword: "Steady",
    category: "Action",
    shortMeaning:
      "Balance isn't symmetry. It's knowing which side to lean into right now.",
    deeperMeaning:
      "Balance is dynamic, not static. Help the user identify which area of life is currently underfed and what one small adjustment could restore equilibrium.",
  },
  {
    id: "change",
    name: "Change",
    keyword: "New shape",
    category: "Action",
    shortMeaning:
      "Something is asking to be different. You don't have to force it — just stop resisting it.",
    deeperMeaning:
      "Change is already happening. The card invites the user to consciously meet it rather than be moved by it. What would it look like to participate?",
  },
  {
    id: "self-worth",
    name: "Self Worth",
    keyword: "Inherent",
    category: "Emotion",
    shortMeaning:
      "Your value isn't earned through output. It's the floor, not the ceiling.",
    deeperMeaning:
      "Self Worth surfaces when the user is overgiving or seeking external proof. Invite them to notice where they're performing for permission they already have.",
  },
  {
    id: "patience",
    name: "Patience",
    keyword: "Time as ally",
    category: "Mind",
    shortMeaning:
      "Some things only reveal themselves slowly. Speed isn't always progress.",
    deeperMeaning:
      "Patience is active, not passive. Help the user distinguish between waiting because something is forming, and waiting because they're avoiding a decision.",
  },
  {
    id: "direction",
    name: "Direction",
    keyword: "True north",
    category: "Action",
    shortMeaning:
      "You don't need the whole map. You need the next honest step.",
    deeperMeaning:
      "Direction is about alignment with values, not a fixed destination. Help the user identify the value they want their next decision to express.",
  },
  {
    id: "energy",
    name: "Energy",
    keyword: "What feeds you",
    category: "Emotion",
    shortMeaning:
      "Notice what gives you life and what quietly drains it. Your time will follow.",
    deeperMeaning:
      "Energy invites an audit. Encourage the user to name one thing they will protect, and one thing they will say no to this week.",
  },
];

export function drawCards(count: 1 | 3): OracleCard[] {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCardById(id: string): OracleCard | undefined {
  return DECK.find((c) => c.id === id);
}
