// Modobeam — Life Area cards
// 25 modern, human-centered life domains. Inspired by classical life-area
// frameworks (e.g. astrological houses) but translated into grounded,
// non-mystical language. Used as a contextual layer in readings and
// browsable as a deck of their own.

export type LifeAreaTheme =
  | "Self"
  | "Direction"
  | "Work & Resources"
  | "Home & Safety"
  | "Relationships"
  | "Change & Healing"
  | "Inner World";

// The motif is a tiny hint to the SVG renderer about which symbolic shape
// to draw. Kept abstract on purpose — calm over expressive.
export type LifeAreaMotif =
  | "centered-circle" // Self / Identity
  | "rising-arc" // Confidence
  | "upward-stem" // Growth
  | "horizon-path" // Direction
  | "north-star" // Purpose
  | "stacked-blocks" // Work
  | "ascending-bars" // Ambition
  | "stacked-coins" // Money
  | "anchored-base" // Stability
  | "enclosed-form" // Home
  | "sheltered-arc" // Safety
  | "two-shapes" // Relationships
  | "linked-rings" // Connection
  | "container-frame" // Boundaries
  | "connecting-lines" // Communication
  | "parallel-paths" // Friendship
  | "interlocking-hearts" // Love (abstract — two soft curves)
  | "fading-shape" // Loss
  | "shifting-shapes" // Change
  | "released-thread" // Letting Go
  | "mending-line" // Healing
  | "layered-shapes" // Inner World
  | "mirrored-form" // Reflection
  | "symmetrical-balance" // Balance
  | "open-vessel"; // (reserved if needed)

export interface LifeAreaCard {
  id: string;
  name: string;
  theme: LifeAreaTheme;
  motif: LifeAreaMotif;
  /** 1–2 sentences. Clear and grounded. */
  shortMeaning: string;
  /** 3–4 sentences. How it shows up in real life. */
  deeperMeaning: string;
  /** 2–3 practical, introspective questions. */
  prompts: string[];
}

export const LIFE_AREAS: LifeAreaCard[] = [
  // ───────── SELF ─────────
  {
    id: "self",
    name: "Self",
    theme: "Self",
    motif: "centered-circle",
    shortMeaning:
      "Your relationship with yourself sets the tone for everything else. Coming home to it is the work.",
    deeperMeaning:
      "Self isn't ego, and it isn't performance — it's the quiet center you keep returning to underneath the roles you play. When this area lights up, it usually means you've drifted from your own signal and started borrowing other people's. Reconnecting doesn't require a reinvention; it asks you to listen to what's already true.",
    prompts: [
      "Where am I living from someone else's expectations right now?",
      "What feels like me, regardless of who's watching?",
      "What would change if I trusted my own sense of things?",
    ],
  },
  {
    id: "identity",
    name: "Identity",
    theme: "Self",
    motif: "mirrored-form",
    shortMeaning:
      "You're between two versions of yourself — the one you've been and the one you're becoming.",
    deeperMeaning:
      "Identity surfaces when an old story about who you are no longer fits, but the new one hasn't fully arrived. The discomfort is usually not a problem; it's a sign you've outgrown a shape. You don't have to rush into a label — you can let yourself live in the in-between while you find out what's true.",
    prompts: [
      "Which part of how I describe myself is no longer accurate?",
      "What am I outgrowing, and what am I growing into?",
      "Who am I when no one needs anything from me?",
    ],
  },
  {
    id: "confidence",
    name: "Confidence",
    theme: "Self",
    motif: "rising-arc",
    shortMeaning:
      "Confidence isn't certainty. It's the willingness to act before you feel fully ready.",
    deeperMeaning:
      "Confidence often gets confused with having no fear, but it's actually trust — trust that you can handle the outcome whether it goes well or not. It builds in small, repeated moments of doing the thing anyway. Waiting to feel confident first is usually the long way around; the feeling tends to follow the action.",
    prompts: [
      "What am I waiting to feel ready for that I could begin today?",
      "Where am I underestimating what I can handle?",
      "What's a small, doable next step I've been avoiding?",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    theme: "Self",
    motif: "upward-stem",
    shortMeaning:
      "You're being asked to stretch slightly past who you've been. The stretch is the point.",
    deeperMeaning:
      "Growth rarely looks like growth from inside it — it looks like awkwardness, doubt, or being a beginner again. This area shows up when you've been playing it safe in a way that's starting to cost you. The next chapter usually asks for a little more honesty, a little more risk, and a little more patience with the messy middle.",
    prompts: [
      "Where have I been playing small to stay comfortable?",
      "What would I attempt if I trusted myself by 10% more?",
      "What's the next honest stretch, even if it's small?",
    ],
  },

  // ───────── DIRECTION ─────────
  {
    id: "direction",
    name: "Direction",
    theme: "Direction",
    motif: "horizon-path",
    shortMeaning:
      "You don't need the whole map. You need the next honest step in a direction that fits.",
    deeperMeaning:
      "Direction isn't a fixed destination — it's the value your next decision expresses. When the long view feels foggy, this card asks you to focus on whether the next step points toward who you're becoming. Clarity about direction usually arrives through movement, not through more thinking.",
    prompts: [
      "What value do I want my next decision to express?",
      "What would the next honest step look like, even if small?",
      "Am I waiting for certainty before I'll move?",
    ],
  },
  {
    id: "purpose",
    name: "Purpose",
    theme: "Direction",
    motif: "north-star",
    shortMeaning:
      "Purpose is less a single answer and more a quiet pull you keep returning to.",
    deeperMeaning:
      "Purpose rarely arrives as a thunderclap. It tends to show up as the things you're drawn to even when no one's asking, the work that makes you feel more like yourself, the problems you can't help noticing. This area asks you to stop searching for the perfect mission and start paying attention to the small, honest pulls already in your life.",
    prompts: [
      "What do I keep coming back to, even without permission?",
      "When do I feel most like myself in what I'm doing?",
      "What would I spend my time on if no one was watching?",
    ],
  },

  // ───────── WORK & RESOURCES ─────────
  {
    id: "work",
    name: "Work",
    theme: "Work & Resources",
    motif: "stacked-blocks",
    shortMeaning:
      "Work isn't just what you do — it's how you spend most of your daylight and energy.",
    deeperMeaning:
      "This area surfaces when something in your relationship with work needs honest attention: the pace, the meaning, the boundaries, or the fit. It's not always a sign to leave; sometimes it's a sign to redesign. The question worth asking is whether the way you're working still matches the life you're trying to build.",
    prompts: [
      "What part of my work still genuinely fits me?",
      "What am I tolerating that I haven't named?",
      "What would I change if no one would judge the choice?",
    ],
  },
  {
    id: "ambition",
    name: "Ambition",
    theme: "Work & Resources",
    motif: "ascending-bars",
    shortMeaning:
      "Ambition is healthy when it's yours. It costs you when it's borrowed.",
    deeperMeaning:
      "Ambition can be a clean force — the desire to do meaningful, demanding work — or it can be a treadmill of proving yourself to people whose approval will never feel like enough. This card asks you to separate the two. The version that comes from your own values feels grounded; the version that comes from fear feels endless.",
    prompts: [
      "Whose definition of success am I actually chasing?",
      "What would 'enough' look like for me?",
      "What am I working toward that I'd still want if no one noticed?",
    ],
  },
  {
    id: "money",
    name: "Money",
    theme: "Work & Resources",
    motif: "stacked-coins",
    shortMeaning:
      "Money is rarely just about money. It's also about safety, freedom, and what you believe you deserve.",
    deeperMeaning:
      "Your relationship with money is shaped by old stories — what you saw growing up, what felt scarce, what felt shameful to want. This area asks you to look at the patterns honestly without judgment. Clarity here isn't about earning more; it's about understanding what money is actually doing for you, and what it can't.",
    prompts: [
      "What story about money did I inherit?",
      "Where am I using money to manage a feeling?",
      "What would 'enough' feel like, in real numbers and in real life?",
    ],
  },
  {
    id: "stability",
    name: "Stability",
    theme: "Work & Resources",
    motif: "anchored-base",
    shortMeaning:
      "Stability is the quiet ground that lets everything else move.",
    deeperMeaning:
      "Stability isn't the absence of change — it's the base that lets you handle change without losing yourself. This card shows up when something in your foundation needs reinforcing: rest, routine, finances, a steady relationship with yourself. The work isn't dramatic; it's the small, repeatable things that hold the rest of your life up.",
    prompts: [
      "What in my foundation is wobbling right now?",
      "What small, steady habit would actually help?",
      "Where am I building on something that won't hold?",
    ],
  },

  // ───────── HOME & SAFETY ─────────
  {
    id: "home",
    name: "Home",
    theme: "Home & Safety",
    motif: "enclosed-form",
    shortMeaning:
      "Home is the place — and the inner state — where you can finally exhale.",
    deeperMeaning:
      "Home is more than an address; it's where you stop performing. This area asks you to notice whether the spaces and people you call home actually let you rest. Sometimes the work is on the outer home — the room, the city, the routines. Sometimes it's on the inner one — the relationship with yourself that follows you anywhere.",
    prompts: [
      "Where in my life can I fully exhale right now?",
      "What about my current home — outer or inner — needs tending?",
      "What would 'home' feel like if I built it on purpose?",
    ],
  },
  {
    id: "safety",
    name: "Safety",
    theme: "Home & Safety",
    motif: "sheltered-arc",
    shortMeaning:
      "Safety isn't the absence of risk. It's knowing you can take care of yourself through whatever comes.",
    deeperMeaning:
      "When this area surfaces, it's usually pointing at an old place where you didn't feel safe and a current pattern built to make sure you never feel that way again. The pattern often costs you — in over-control, in distance, in saying no to things that matter. Real safety isn't a bunker; it's a relationship with yourself you can trust.",
    prompts: [
      "Where is an old fear running a current decision?",
      "What does safety actually look like for me — not in theory?",
      "What would I do if I trusted I could handle the outcome?",
    ],
  },

  // ───────── RELATIONSHIPS ─────────
  {
    id: "relationships",
    name: "Relationships",
    theme: "Relationships",
    motif: "two-shapes",
    shortMeaning:
      "How you show up with others reflects how you're showing up with yourself.",
    deeperMeaning:
      "Relationships are mirrors more often than mysteries. The patterns that keep appearing — over-giving, withdrawing, picking the same kind of person, avoiding closeness — are usually pointing at something in you, not just them. This area asks you to look at the dynamic honestly, with curiosity instead of blame.",
    prompts: [
      "What pattern keeps repeating in my close relationships?",
      "Where am I asking someone else to do work that's mine?",
      "What would change if I brought my fuller self to this?",
    ],
  },
  {
    id: "connection",
    name: "Connection",
    theme: "Relationships",
    motif: "linked-rings",
    shortMeaning:
      "Connection is built in small moments of being seen — and seeing back.",
    deeperMeaning:
      "Connection isn't proximity; you can be surrounded by people and feel deeply alone. This area surfaces when there's a quiet hunger for something more honest — fewer surface conversations, more being known. The work usually starts by being a little more honest yourself, even when it feels exposed.",
    prompts: [
      "Where am I performing closeness instead of feeling it?",
      "Who do I feel most like myself around — and why?",
      "What would I share if I trusted I'd be received well?",
    ],
  },
  {
    id: "boundaries",
    name: "Boundaries",
    theme: "Relationships",
    motif: "container-frame",
    shortMeaning:
      "A boundary isn't a wall. It's clarity about what you can and can't carry.",
    deeperMeaning:
      "Boundaries usually feel uncomfortable because they interrupt patterns other people have come to expect. The discomfort is often a signal the boundary was needed, not a sign it was wrong. You're not responsible for managing how others feel about your limits — only for being honest about them.",
    prompts: [
      "Where am I overextending and calling it kindness?",
      "What would I say no to if I weren't afraid of the reaction?",
      "What does respecting my own time look like this week?",
    ],
  },
  {
    id: "communication",
    name: "Communication",
    theme: "Relationships",
    motif: "connecting-lines",
    shortMeaning:
      "Most relational pain is a missing conversation in disguise.",
    deeperMeaning:
      "Communication shows up when something has gone unsaid for too long — a need, a hurt, a preference, a truth. The longer it sits, the more the resentment grows around it. The work isn't to find the perfect words; it's to choose the slightly uncomfortable honesty over the polite distance.",
    prompts: [
      "What conversation have I been avoiding?",
      "What do I need this person to actually hear?",
      "What would I say if I trusted I could stay grounded through their reaction?",
    ],
  },
  {
    id: "friendship",
    name: "Friendship",
    theme: "Relationships",
    motif: "parallel-paths",
    shortMeaning:
      "Friendships are easy to neglect and hard to rebuild. They need a little tending.",
    deeperMeaning:
      "This area surfaces when your friendships have quietly thinned out — not from a falling out, just from drift. Friendship is one of the few relationships you have to keep choosing, with no contract and no built-in structure. Even a small reach-out can change the temperature of your week.",
    prompts: [
      "Whose friendship would I want to feel closer to right now?",
      "Where have I let drift become distance?",
      "What's one small reach-out I could make this week?",
    ],
  },
  {
    id: "love",
    name: "Love",
    theme: "Relationships",
    motif: "interlocking-hearts",
    shortMeaning:
      "Love asks you to be seen, not just to give. Receiving is part of the practice.",
    deeperMeaning:
      "This card often appears when you've been loving from a place of effort rather than presence. Real love doesn't require you to disappear, perform, or earn your place in it. The deeper invitation is to notice where you're giving to stay safe, instead of giving because you're full.",
    prompts: [
      "Am I loving from fullness or from fear?",
      "Where am I giving to be chosen?",
      "What would change if I let myself be fully seen?",
    ],
  },

  // ───────── CHANGE & HEALING ─────────
  {
    id: "loss",
    name: "Loss",
    theme: "Change & Healing",
    motif: "fading-shape",
    shortMeaning:
      "Loss asks for honesty, not speed. There's no version of grief that skips the middle.",
    deeperMeaning:
      "Loss isn't only about death — it's about anything you cared about that's no longer here in the same form. The work isn't to move on; it's to let the shape of the loss exist without rushing it away. Grief gets quieter when it's allowed to be present, not when it's pushed underground.",
    prompts: [
      "What loss am I trying not to fully feel?",
      "What part of me is asking to be honored about this?",
      "What would tenderness look like today?",
    ],
  },
  {
    id: "change",
    name: "Change",
    theme: "Change & Healing",
    motif: "shifting-shapes",
    shortMeaning:
      "Something is already shifting. You don't have to force it — but you do have to stop resisting it.",
    deeperMeaning:
      "Change is rarely the problem; resistance to it is. This card shows up when you're spending more energy holding the old shape together than it would take to meet the new one. You're allowed to grieve what's ending and still walk toward what's next.",
    prompts: [
      "What's already changing that I haven't acknowledged?",
      "What am I trying to preserve out of fear?",
      "What would it look like to participate in this change instead of resisting it?",
    ],
  },
  {
    id: "letting-go",
    name: "Letting Go",
    theme: "Change & Healing",
    motif: "released-thread",
    shortMeaning:
      "You already know it's time. You're just hoping there's another way.",
    deeperMeaning:
      "Letting go often arrives long before you act on it. The delay is rarely about the decision — it's about grieving the version of life that included this thing. Letting go isn't betrayal of what was; it's honesty about what is.",
    prompts: [
      "What am I trying to keep alive that's already changed?",
      "What would I make space for if I let this go?",
      "What's one small way I can begin the release this week?",
    ],
  },
  {
    id: "healing",
    name: "Healing",
    theme: "Change & Healing",
    motif: "mending-line",
    shortMeaning:
      "Healing isn't linear. Returning to old feelings doesn't mean you've gone backwards.",
    deeperMeaning:
      "Healing happens in layers — what you healed last year often returns at a deeper level this year. This isn't regression; it's deeper access. Be patient with yourself for needing to feel something again. The body remembers what the mind has tried to move past.",
    prompts: [
      "What part of me is asking for care right now?",
      "Am I confusing healing with forgetting?",
      "What would tenderness look like today?",
    ],
  },

  // ───────── INNER WORLD ─────────
  {
    id: "inner-world",
    name: "Inner World",
    theme: "Inner World",
    motif: "layered-shapes",
    shortMeaning:
      "There's a whole life happening underneath the visible one. It deserves your attention too.",
    deeperMeaning:
      "Your inner world — the moods, the dreams, the half-formed thoughts, the things you only half-admit — shapes more of your outer life than you tend to notice. This area asks you to slow down enough to actually visit it. The reward isn't always insight; sometimes it's just a quieter relationship with yourself.",
    prompts: [
      "What have I been feeling that I haven't put into words?",
      "What does the quieter part of me actually want right now?",
      "What would I notice if I stopped scrolling for an hour?",
    ],
  },
  {
    id: "reflection",
    name: "Reflection",
    theme: "Inner World",
    motif: "mirrored-form",
    shortMeaning:
      "Reflection isn't rumination. It's looking back so you can move forward more honestly.",
    deeperMeaning:
      "Reflection turns experience into understanding. Without it, the same lessons keep re-introducing themselves in slightly different outfits. This card asks you to actually pause — not to obsess, but to notice — what the recent chapter has been trying to teach you.",
    prompts: [
      "What pattern have I noticed in myself lately?",
      "What is this season of my life actually about?",
      "What would I tell a friend going through what I'm going through?",
    ],
  },
  {
    id: "balance",
    name: "Balance",
    theme: "Inner World",
    motif: "symmetrical-balance",
    shortMeaning:
      "Balance isn't a perfect split. It's catching yourself before you tip too far.",
    deeperMeaning:
      "Balance isn't static — it's a series of small corrections. This card surfaces when you've leaned too far in one direction for too long: too much output, too much input, too much giving, too much alone. The work isn't to overcorrect; it's to notice early and adjust gently before the system breaks.",
    prompts: [
      "Where have I been leaning too far for too long?",
      "What's the smallest correction I could make this week?",
      "What does enough — not perfect — look like here?",
    ],
  },
];

export function getLifeAreaById(id: string): LifeAreaCard | undefined {
  return LIFE_AREAS.find((c) => c.id === id);
}

// ────────────────────────────────────────────────────────────────────────
// Mapping from the existing astrology focus area (12 houses) to a Life
// Area card. Each house picks one card whose meaning sits closest to it.
// Keeps the system unified: focusArea on an insight maps to a real card
// the user can open.

export const HOUSE_TO_LIFE_AREA: Record<number, string> = {
  1: "self", // Self & beginnings
  2: "money", // Values & resources
  3: "communication", // Voice & curiosity
  4: "home", // Home & inner life
  5: "growth", // Expression & play (closest match: stretch / becoming)
  6: "stability", // Daily rhythm & care
  7: "relationships", // One-to-one others
  8: "letting-go", // Depth & change
  9: "purpose", // Meaning & search
  10: "direction", // Direction & work
  11: "connection", // Belonging & vision
  12: "inner-world", // Inner processing
};

export function lifeAreaForHouse(house: number): LifeAreaCard | undefined {
  const id = HOUSE_TO_LIFE_AREA[house];
  return id ? getLifeAreaById(id) : undefined;
}

// ────────────────────────────────────────────────────────────────────────
// Light keyword matcher — picks a Life Area from free text alone, used
// when no astrology focus is available so every reading can still be
// gently contextualized.

const KEYWORD_TO_AREA: Record<string, string> = {
  // self
  identity: "identity",
  self: "self",
  who: "self",
  confidence: "confidence",
  doubt: "confidence",
  growth: "growth",
  becoming: "growth",
  // direction
  direction: "direction",
  purpose: "purpose",
  path: "direction",
  meaning: "purpose",
  // work / resources
  work: "work",
  job: "work",
  career: "work",
  ambition: "ambition",
  goal: "ambition",
  money: "money",
  finance: "money",
  enough: "money",
  stability: "stability",
  rest: "stability",
  routine: "stability",
  // home / safety
  home: "home",
  family: "home",
  safety: "safety",
  fear: "safety",
  // relationships
  relationship: "relationships",
  partner: "relationships",
  connection: "connection",
  closeness: "connection",
  boundary: "boundaries",
  boundaries: "boundaries",
  communication: "communication",
  conversation: "communication",
  friend: "friendship",
  friendship: "friendship",
  love: "love",
  intimacy: "love",
  // change / healing
  loss: "loss",
  grief: "loss",
  ending: "loss",
  change: "change",
  shift: "change",
  release: "letting-go",
  letting: "letting-go",
  healing: "healing",
  repair: "healing",
  // inner world
  inner: "inner-world",
  dream: "inner-world",
  reflection: "reflection",
  pattern: "reflection",
  balance: "balance",
};

export function inferLifeAreaFromText(text: string): LifeAreaCard | null {
  const t = text.toLowerCase();
  const scores = new Map<string, number>();
  for (const [word, id] of Object.entries(KEYWORD_TO_AREA)) {
    const re = new RegExp(`\\b${word}\\w*\\b`, "g");
    const matches = t.match(re);
    if (matches) {
      scores.set(id, (scores.get(id) ?? 0) + matches.length);
    }
  }
  if (scores.size === 0) return null;
  const [topId] = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
  return getLifeAreaById(topId) ?? null;
}
