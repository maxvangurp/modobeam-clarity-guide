export type CardCategory = "Mind" | "Emotion" | "Action" | "Life Patterns";

export interface OracleCard {
  id: string;
  name: string;
  keyword: string;
  category: CardCategory;
  shortMeaning: string;
  deeperMeaning: string;
  prompts: string[];
}

export const DECK: OracleCard[] = [
  // ───────── MIND ─────────
  {
    id: "clarity",
    name: "Clarity",
    keyword: "See clearly",
    category: "Mind",
    shortMeaning:
      "You already know more than you're letting yourself admit. The answer feels quiet because it isn't dramatic.",
    deeperMeaning:
      "Clarity often arrives in plain language, not in revelation. This card shows up when you've been waiting for proof before trusting what you already sense. The work isn't to find a new answer, but to stop negotiating with the one you have.",
    prompts: [
      "What do I already know to be true here?",
      "Where am I waiting for permission instead of acting?",
      "If I removed everyone else's opinion, what would I choose?",
    ],
  },
  {
    id: "doubt",
    name: "Doubt",
    keyword: "Listen, don't obey",
    category: "Mind",
    shortMeaning:
      "Doubt is information, not a verdict. It tells you something matters — not that you're wrong.",
    deeperMeaning:
      "Doubt usually points to a place where you're growing past an old version of yourself. It often gets confused with intuition, but doubt repeats and tightens, while intuition speaks once and stays calm. Treat doubt as a question to investigate, not a command to obey.",
    prompts: [
      "Is this doubt protecting me, or limiting me?",
      "Where is this voice familiar from?",
      "What would I do if I trusted myself by 10% more?",
    ],
  },
  {
    id: "overthinking",
    name: "Overthinking",
    keyword: "Loop",
    category: "Mind",
    shortMeaning:
      "You're trying to think your way out of something only feeling can resolve.",
    deeperMeaning:
      "Overthinking is often a way to stay in control when something feels uncertain. The mind keeps rehearsing scenarios so the body doesn't have to feel the discomfort underneath. Naming the feeling you're avoiding usually does more than another lap of analysis.",
    prompts: [
      "What feeling am I trying to outrun with thinking?",
      "What would I do if I trusted my first instinct?",
      "What's the smallest action that would break the loop?",
    ],
  },
  {
    id: "perspective",
    name: "Perspective",
    keyword: "Step back",
    category: "Mind",
    shortMeaning:
      "You're standing too close to see the shape of it. Distance isn't avoidance — it's clarity.",
    deeperMeaning:
      "Perspective shows up when you've been inside a problem long enough to mistake it for the whole picture. Stepping back isn't about minimizing what you feel; it's about seeing how the moment fits into a longer story. Often what feels enormous today is one chapter, not the book.",
    prompts: [
      "How will I see this in six months?",
      "What am I making bigger than it is?",
      "What part of this is mine to solve, and what isn't?",
    ],
  },
  {
    id: "truth",
    name: "Truth",
    keyword: "Honest",
    category: "Mind",
    shortMeaning:
      "There's something you've stopped saying out loud — even to yourself.",
    deeperMeaning:
      "Truth surfaces when you've been performing a version of the situation that's easier than the real one. The cost of avoiding it usually shows up as fatigue, irritation, or a dull sense of being slightly off. Telling yourself the truth is the part that costs the most — and changes the most.",
    prompts: [
      "What am I pretending not to know?",
      "Who am I being honest with, and who am I performing for?",
      "What would I say if I knew it would be received well?",
    ],
  },
  {
    id: "control",
    name: "Control",
    keyword: "Loosen the grip",
    category: "Mind",
    shortMeaning:
      "You're trying to hold something steady that was never yours to manage.",
    deeperMeaning:
      "Control is often a response to old uncertainty — a way to feel safe when something important feels unstable. The tighter the grip, the more it signals fear underneath, not strength. The question isn't how to control more, but where you can safely trust again.",
    prompts: [
      "What am I afraid will happen if I let go a little?",
      "What is mine to manage, and what isn't?",
      "Where would softness serve me more than effort?",
    ],
  },

  // ───────── EMOTION ─────────
  {
    id: "love",
    name: "Love",
    keyword: "Open",
    category: "Emotion",
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
  {
    id: "attachment",
    name: "Attachment",
    keyword: "Holding tight",
    category: "Emotion",
    shortMeaning:
      "You're holding on to something — or someone — because letting go feels like losing yourself.",
    deeperMeaning:
      "Attachment isn't the same as love. It's often about the version of you that exists inside the connection, and the fear of who you'd be without it. Loosening attachment doesn't mean caring less; it means letting the relationship breathe without your grip on the outcome.",
    prompts: [
      "What am I afraid I'll lose about myself if this changes?",
      "Am I holding on to the person, or to the hope?",
      "What would it feel like to want this without needing it?",
    ],
  },
  {
    id: "letting-go",
    name: "Letting Go",
    keyword: "Release",
    category: "Emotion",
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
    keyword: "Slow repair",
    category: "Emotion",
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
  {
    id: "longing",
    name: "Longing",
    keyword: "Quiet ache",
    category: "Emotion",
    shortMeaning:
      "Longing is honest. It's pointing at something you haven't given yourself permission to want.",
    deeperMeaning:
      "Longing is often dismissed as weakness, but it's a signal — not a problem. It shows you what matters by the way it aches. The work isn't to silence it; it's to listen to what it's actually asking for, separate from any one person or outcome.",
    prompts: [
      "What is this longing really asking for?",
      "Where can I begin to give some of this to myself?",
      "What would I do differently if I trusted that wanting is okay?",
    ],
  },
  {
    id: "acceptance",
    name: "Acceptance",
    keyword: "What is",
    category: "Emotion",
    shortMeaning:
      "Acceptance doesn't mean you're okay with it. It means you stop fighting reality so you can respond to it.",
    deeperMeaning:
      "Acceptance is often confused with approval. It's actually the moment you stop arguing with what already is, so you can choose what to do next. The relief isn't in liking the situation — it's in no longer spending energy trying to make it different than it is.",
    prompts: [
      "What am I still arguing with that has already happened?",
      "What becomes possible when I stop resisting this?",
      "What would I do next if I fully accepted it?",
    ],
  },

  // ───────── ACTION ─────────
  {
    id: "focus",
    name: "Focus",
    keyword: "One thing",
    category: "Action",
    shortMeaning:
      "You're spread across too many things to do any of them well. Choose one.",
    deeperMeaning:
      "Focus is about subtraction, not effort. When everything feels important, nothing gets your full self. The question isn't how to do more, but what you can deliberately set down — for now — so the thing that matters most can have you completely.",
    prompts: [
      "If I could only move one thing forward this week, what would it be?",
      "What am I doing out of habit instead of intention?",
      "What would I let go of if I trusted my priorities?",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    keyword: "Stretch",
    category: "Action",
    shortMeaning:
      "The discomfort you're feeling isn't a sign you're off track. It's the texture of becoming.",
    deeperMeaning:
      "Growth rarely feels like growth in the moment — it usually feels like awkwardness, exposure, or doubt. You're being asked to operate slightly past your current edge, which always feels unsafe before it feels expansive. Stay with the discomfort a little longer than feels comfortable.",
    prompts: [
      "What would I attempt if I trusted myself a little more?",
      "Where am I mistaking discomfort for being on the wrong path?",
      "What's the next honest step, even if it's small?",
    ],
  },
  {
    id: "change",
    name: "Change",
    keyword: "New shape",
    category: "Action",
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
    id: "patience",
    name: "Patience",
    keyword: "Time as ally",
    category: "Action",
    shortMeaning:
      "Some things only reveal themselves slowly. Speed isn't always progress.",
    deeperMeaning:
      "Patience is active, not passive. There's a difference between waiting because something is genuinely forming, and waiting because you're avoiding a decision. The first kind of waiting feels grounded; the second kind feels heavy. Notice which one you're in.",
    prompts: [
      "Am I waiting because it's wise, or because it's easier?",
      "What is quietly forming that I can't yet see?",
      "What would patient action look like — not no action?",
    ],
  },
  {
    id: "boundaries",
    name: "Boundaries",
    keyword: "Define",
    category: "Action",
    shortMeaning:
      "A boundary isn't a wall. It's clarity about what you can and can't carry.",
    deeperMeaning:
      "Boundaries usually feel uncomfortable because they interrupt patterns other people have come to expect. The discomfort is often a sign the boundary was needed, not that it was wrong. You're not responsible for managing how others feel about your limits — only for being honest about them.",
    prompts: [
      "Where am I overextending and calling it kindness?",
      "What would I say no to if I weren't afraid of the reaction?",
      "What does respecting my own time look like this week?",
    ],
  },
  {
    id: "discipline",
    name: "Discipline",
    keyword: "Show up",
    category: "Action",
    shortMeaning:
      "You don't need more motivation. You need to keep your word to yourself when it's inconvenient.",
    deeperMeaning:
      "Discipline isn't punishment — it's a form of self-trust. Each time you follow through on something small, you teach yourself that you can be relied on. Motivation is a feeling that comes and goes; discipline is the structure that holds you when feelings don't.",
    prompts: [
      "What promise to myself have I been breaking?",
      "What's the smallest version of this I could actually do today?",
      "What does keeping my word to myself look like this week?",
    ],
  },

  // ───────── LIFE PATTERNS ─────────
  {
    id: "timing",
    name: "Timing",
    keyword: "Not yet — or not now",
    category: "Life Patterns",
    shortMeaning:
      "Right thing, wrong moment is still wrong moment. Timing is part of the answer.",
    deeperMeaning:
      "When something keeps not working, it's worth asking whether it's the wrong thing or just the wrong time. Forcing the right thing in the wrong moment can make you doubt the thing itself. Sometimes the most useful action is to wait skillfully and let the conditions catch up.",
    prompts: [
      "Am I forcing this because I'm afraid the window will close?",
      "What would shift if I trusted that the timing matters?",
      "What can I prepare now, even if I can't act yet?",
    ],
  },
  {
    id: "alignment",
    name: "Alignment",
    keyword: "Inside matches outside",
    category: "Life Patterns",
    shortMeaning:
      "You already feel that something isn't fitting, but you're not fully acting on it yet.",
    deeperMeaning:
      "This card often shows up when you're aware of a mismatch between what you value and how you're actually living, but you're still trying to rationalize the gap. The tension you feel isn't a problem — it's a signal. Alignment isn't dramatic; it's quiet relief.",
    prompts: [
      "What am I trying to justify that I already know?",
      "Where do my actions and my values disagree?",
      "What would change if I trusted that feeling?",
    ],
  },
  {
    id: "self-worth",
    name: "Self Worth",
    keyword: "Inherent",
    category: "Life Patterns",
    shortMeaning:
      "Your value isn't something you earn through output. It's the floor, not the ceiling.",
    deeperMeaning:
      "Self worth surfaces when you've been overgiving, overworking, or shrinking yourself to keep something safe. The question isn't how to prove your value — it's where you stopped believing it was already there. You're allowed to take up space without justifying it.",
    prompts: [
      "Where am I performing for permission I already have?",
      "What would I do differently if I knew my worth wasn't on the line?",
      "What am I tolerating that I wouldn't accept for someone I love?",
    ],
  },
  {
    id: "release",
    name: "Release",
    keyword: "Make space",
    category: "Life Patterns",
    shortMeaning:
      "You're carrying things that aren't yours anymore — old roles, old stories, old expectations.",
    deeperMeaning:
      "Release is about identity as much as objects. Often what's hardest to put down isn't the thing itself, but the version of you that's been holding it. Letting it go isn't a loss; it's making room for the version of you that's already arriving.",
    prompts: [
      "What am I still carrying out of habit?",
      "Who would I be without this story?",
      "What would I make space for if I put this down?",
    ],
  },
  {
    id: "return",
    name: "Return",
    keyword: "Come back",
    category: "Life Patterns",
    shortMeaning:
      "You've drifted from something that matters to you. The way back isn't dramatic — it's a small step in the right direction.",
    deeperMeaning:
      "Return shows up when you've slowly moved away from a value, a person, a practice, or a version of yourself that felt true. There's no need to punish the drift; everyone drifts. The work is to notice it and gently begin walking back, without making the journey heavier than it needs to be.",
    prompts: [
      "What part of myself have I lost touch with?",
      "What would coming back look like in a small, real way?",
      "What's one thing I can do today that the truer version of me would recognize?",
    ],
  },
  {
    id: "direction",
    name: "Direction",
    keyword: "True north",
    category: "Life Patterns",
    shortMeaning:
      "You don't need the whole map. You need the next honest step.",
    deeperMeaning:
      "Direction isn't about a fixed destination — it's about which value you want your next decision to express. When you can't see far ahead, focus on whether the next step is aligned with who you're becoming. Clarity about direction usually comes from movement, not from waiting.",
    prompts: [
      "What value do I want my next decision to express?",
      "What would the next honest step look like, even if it's small?",
      "Am I waiting for certainty before I'll move?",
    ],
  },
];

export function drawCards(count: number): OracleCard[] {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCardById(id: string): OracleCard | undefined {
  return DECK.find((c) => c.id === id);
}
