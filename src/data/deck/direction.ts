import type { OracleCard } from "./types";

export const DIRECTION_CARDS: OracleCard[] = [
  {
    id: "direction",
    name: "Direction",
    keyword: "Your path is forming",
    category: "Direction",
    shortMeaning:
      "When the way forward isn't clear, but something inside you already knows which way to lean.",
    deeperMeaning:
      "Direction isn't about having a map. It's about trusting the pull you feel toward one possibility over another. You may not know the destination, but you know the next step. This card arrives when you've been waiting for certainty that isn't coming — and invites you to move anyway, guided by the quieter signal of what feels right. The path forms beneath your feet only when you walk.",
    prompts: [
      "What is one small step that feels right, even if you can't explain why?",
      "Where have you been waiting for certainty before you move?",
      "What would you try if you trusted your own sense of direction more?",
    ],
  },
  {
    id: "ambition",
    name: "Ambition",
    keyword: "The fire that drives",
    category: "Direction",
    shortMeaning:
      "The hunger to become more, to build, to leave a mark. It can lift you or consume you.",
    deeperMeaning:
      "Ambition is neither virtue nor flaw — it is energy, and energy needs tending. When aligned with who you are, it pulls you forward with clarity. When detached from your values, it becomes a treadmill of never-enough. This card asks: whose definition of success are you running toward? And what would ambition look like if it were rooted in what actually matters to you?",
    prompts: [
      "What does success actually look like for you — not for others?",
      "Where has ambition become a source of pressure rather than pull?",
      "What would you build if no one ever saw it?",
    ],
  },
  {
    id: "stuckness",
    name: "Stuckness",
    keyword: "When nothing moves",
    category: "Direction",
    shortMeaning:
      "The pause that feels like failure. Often it's the soil where the next thing is quietly taking root.",
    deeperMeaning:
      "Stuckness is rarely empty. Beneath the surface, something is reorganizing — old patterns dissolving, new ones not yet visible. The discomfort is real, but so is the work happening in the dark. This card doesn't promise quick movement. It asks you to notice what the stillness is trying to tell you, and to trust that not all growth looks like forward motion.",
    prompts: [
      "What is this stuckness protecting you from rushing into?",
      "If you weren't stuck, what would you be avoiding?",
      "What small part of you is already beginning to shift?",
    ],
  },
  {
    id: "burnout",
    name: "Burnout",
    keyword: "The empty that follows",
    category: "Direction",
    shortMeaning:
      "When giving becomes depletion. Your body is asking you to stop before your mind will let you.",
    deeperMeaning:
      "Burnout isn't weakness — it's the honest accounting of a system that has been running on debt. The mind keeps pushing because the identity is tied to production. But the body knows first. This card is not a suggestion to rest someday. It is an urgent signal that recovery is part of the work, not a detour from it. What you rebuild after burnout is often more honest than what you built before.",
    prompts: [
      "What are you still doing that your body has already asked you to stop?",
      "Who would you be if you didn't measure worth by output?",
      "What is one boundary you could set that would give you room to breathe?",
    ],
  },
  {
    id: "momentum",
    name: "Momentum",
    keyword: "Catching the wave",
    category: "Direction",
    shortMeaning:
      "Forward motion that carries you. Not forcing, but flowing with what wants to happen next.",
    deeperMeaning:
      "Momentum is the rare state where effort and ease overlap. It doesn't come from pushing harder — it comes from aligning with what's already moving. This card signals that you're in a window where things want to flow. The question isn't how to force more, but how to protect and channel what's already moving. Don't waste this current on distractions.",
    prompts: [
      "What is already moving that you could choose to ride?",
      "What distractions are pulling you out of this flow?",
      "Where are you forcing something that wants to happen naturally?",
    ],
  },
  {
    id: "discipline",
    name: "Discipline",
    keyword: "Showing up anyway",
    category: "Direction",
    shortMeaning:
      "The quiet power of repetition. Not glamour, but the accumulated weight of small choices.",
    deeperMeaning:
      "Discipline is not punishment — it is the architecture of trust you build with yourself. Each small promise kept, each routine honored, is a vote for the person you're becoming. This card appears when the excitement has faded and the real work begins. That is exactly where discipline becomes its most valuable: in the boring middle, where most people stop.",
    prompts: [
      "What one small practice would anchor your days if you kept it?",
      "Where have you been waiting for motivation instead of choosing commitment?",
      "What does discipline feel like when it's gentle rather than harsh?",
    ],
  },
  {
    id: "risk",
    name: "Risk",
    keyword: "The leap before the net",
    category: "Direction",
    shortMeaning:
      "Choosing uncertainty on purpose. The place where growth lives, if you can hold the fear.",
    deeperMeaning:
      "Risk is not recklessness — it is the willingness to act without a guarantee. Every meaningful change requires stepping into a space where the outcome is not yet written. This card arrives when you face a threshold: stay where it's familiar, or move toward something that matters more. The fear is real. So is the possibility that sits on the other side of it.",
    prompts: [
      "What would you do if the risk of staying became greater than the risk of leaving?",
      "What are you protecting by not taking this chance?",
      "What does a smart risk look like here — not reckless, but real?",
    ],
  },
  {
    id: "reinvention",
    name: "Reinvention",
    keyword: "Becoming someone new",
    category: "Direction",
    shortMeaning:
      "Letting go of an old identity to make room for who you're becoming.",
    deeperMeaning:
      "Reinvention is not a single dramatic moment — it is the slow, sometimes painful shedding of who you were in order to become who you need to be next. The old identity served you. It may even have been successful. But it no longer fits. This card asks what you're still holding onto for safety, and what might open up if you allowed yourself to be seen as someone new.",
    prompts: [
      "What old identity are you still performing that no longer fits?",
      "Who are you afraid to disappoint by changing?",
      "What would the next version of you do that the current version won't?",
    ],
  },
  {
    id: "purpose",
    name: "Purpose",
    keyword: "The deeper reason",
    category: "Direction",
    shortMeaning:
      "What pulls you forward when the external rewards stop working.",
    deeperMeaning:
      "Purpose is not a job title or a mission statement. It is the quiet thread that connects what you do to why it matters. When the recognition fades, the money is enough but not fulfilling, and the status stops impressing even you — purpose is what remains. This card asks whether your current path is aligned with that thread, or whether you've been chasing outcomes while the meaning quietly slipped away.",
    prompts: [
      "What do you do that matters to you even when no one notices?",
      "When did you last feel like your work genuinely meant something?",
      "What would you keep doing even if it never got easier or more successful?",
    ],
  },
  {
    id: "friction",
    name: "Friction",
    keyword: "Resistance that teaches",
    category: "Direction",
    shortMeaning:
      "The tension that shows you where your edges are, and what actually matters.",
    deeperMeaning:
      "Friction is not failure — it is information. Where you resist, where things feel hard, where you keep bumping against the same obstacle: these are the boundaries of your current shape. This card invites you to stop avoiding the rub and start reading it. The friction may be telling you to adjust your approach, or it may be telling you that this particular path is not yours to take.",
    prompts: [
      "Where do you keep meeting resistance — and what is it trying to tell you?",
      "Is this friction asking you to adapt, or to walk away?",
      "What are you trying to force that doesn't want to happen your way?",
    ],
  },
  {
    id: "recognition",
    name: "Recognition",
    keyword: "Being seen clearly",
    category: "Direction",
    shortMeaning:
      "The need to have your work, your effort, your self acknowledged by the world.",
    deeperMeaning:
      "Recognition is a real and valid need — not vanity, but the human requirement to know that what you give matters. When it is missing, the work can start to feel hollow no matter how well it is done. This card asks where you are waiting to be seen, and whether you are also capable of giving yourself the acknowledgment you are seeking from others. Recognition from within is harder to build but far more durable.",
    prompts: [
      "Where do you feel unseen — and what would recognition actually change?",
      "How often do you acknowledge your own effort before waiting for others to?",
      "What would it mean to do this work even if no one ever noticed?",
    ],
  },
  {
    id: "consistency",
    name: "Consistency",
    keyword: "The quiet power of repetition",
    category: "Direction",
    shortMeaning:
      "Small actions, repeated. The boring path that actually gets you there.",
    deeperMeaning:
      "Consistency is the least celebrated and most powerful force in any pursuit. It does not feel like progress in the moment. It feels like showing up again, and again, without fanfare. But over time, it compounds into something no single burst of inspiration can match. This card honors the unglamorous daily choice — and asks whether you've been underestimating what repetition could build for you.",
    prompts: [
      "What small action, if repeated for a year, would change everything?",
      "Where have you been chasing intensity when consistency would serve you better?",
      "What makes you stop showing up — and how could you make it easier to return?",
    ],
  },
  {
    id: "comparison",
    name: "Comparison",
    keyword: "Measuring against others",
    category: "Direction",
    shortMeaning:
      "The thief of contentment. What someone else's timeline does to your peace.",
    deeperMeaning:
      "Comparison is not about information — it is about worth. When you measure your progress against someone else's highlight reel, you are not gathering useful data. You are letting their path diminish your own. This card arrives when the noise of other people's success is making your own journey feel insufficient. The truth is, their timing is not your timing, and their definition of enough is not yours.",
    prompts: [
      "Whose timeline are you using to judge your own progress?",
      "What would enough look like if you stopped measuring against others?",
      "What part of your journey is actually going well that you've been overlooking?",
    ],
  },
  {
    id: "confidence",
    name: "Confidence",
    keyword: "Trusting your own competence",
    category: "Direction",
    shortMeaning:
      "Not arrogance, but the grounded belief that you can handle what comes next.",
    deeperMeaning:
      "Confidence is not the absence of doubt — it is the choice to act despite it. It builds not from positive affirmations but from accumulated evidence: you have done hard things before, and you are still here. This card signals a moment to own what you know, to stop apologizing for your competence, and to show up as someone who has earned their place. The room needs you to believe in yourself so others can too.",
    prompts: [
      "What do you know how to do that you consistently downplay?",
      "Where would showing up with more confidence change the outcome?",
      "What evidence from your past proves you are capable of what is ahead?",
    ],
  },
  {
    id: "calling",
    name: "Calling",
    keyword: "The work that chose you",
    category: "Direction",
    shortMeaning:
      "The pull toward something you can't fully explain but can't fully ignore.",
    deeperMeaning:
      "A calling is not always dramatic. It can be a quiet, persistent sense that something else is meant for you — something that fits better, asks more honestly, or matters more deeply. It does not promise ease or success. It only promises alignment. This card asks whether you've been listening to that pull, or whether practical concerns have drowned it out for so long that you've stopped hearing it entirely.",
    prompts: [
      "What have you always been drawn to that you've never allowed yourself to pursue?",
      "What would you do if practical concerns were not part of the equation?",
      "Where have you been forcing yourself to fit a path that doesn't call to you?",
    ],
  },
  {
    id: "overload",
    name: "Overload",
    keyword: "When everything demands",
    category: "Direction",
    shortMeaning:
      "Too many priorities, too little margin. The noise before the breakdown.",
    deeperMeaning:
      "Overload is the state where everything feels urgent and nothing feels possible. It is not a time management problem — it is a priority crisis. When everything matters equally, nothing actually gets the energy it needs. This card is an invitation to subtract. Not to do more, but to do fewer things with enough presence that they can actually land. The cost of overload is not just exhaustion. It is the slow erosion of quality in everything you touch.",
    prompts: [
      "What could you stop doing without the world ending?",
      "What are you saying yes to out of obligation rather than real priority?",
      "If you could only give energy to three things this week, what would they be?",
    ],
  },
  {
    id: "decision",
    name: "Decision",
    keyword: "The weight of choosing",
    category: "Direction",
    shortMeaning:
      "When multiple paths are real and the cost of choosing is also the cost of not choosing.",
    deeperMeaning:
      "Decisions carry grief — even good ones. Every door opened is a door closed, and some part of you will mourn the paths not taken. That does not mean you should delay forever. This card arrives when a choice has ripened, when more information will not help, and the only remaining obstacle is your willingness to commit. The right decision is rarely the one with no downside. It is the one whose downside you are willing to carry.",
    prompts: [
      "What are you pretending you don't already know about this choice?",
      "What is the cost of not deciding — and is it growing?",
      "If you had to choose today, without more research, what would your gut say?",
    ],
  },
  {
    id: "focus",
    name: "Focus",
    keyword: "Giving energy to what matters",
    category: "Direction",
    shortMeaning:
      "The discipline of saying no so the yes can mean something.",
    deeperMeaning:
      "Focus is not concentration — it is elimination. It is the courage to remove what is interesting but not essential, so that what remains can receive the depth it deserves. In a world designed to fragment your attention, focus is a radical act. This card asks what you are spreading yourself across, and what would happen if you allowed one thing to matter more than everything else — even temporarily.",
    prompts: [
      "What is the one thing that would move everything else forward if it got your full attention?",
      "What are you keeping in motion that is actually just distraction?",
      "What would you need to say no to in order to protect what matters most?",
    ],
  },
  {
    id: "patience",
    name: "Patience",
    keyword: "Trusting the timing",
    category: "Direction",
    shortMeaning:
      "Not passivity, but the active choice to let things unfold at their own pace.",
    deeperMeaning:
      "Patience is often misunderstood as waiting. It is not — it is the refusal to force an outcome before its time. It is the wisdom to keep tending, keep preparing, and keep believing while the thing you want is still forming in the dark. This card appears when urgency is costing you more than the delay would. The question is not whether you want it sooner. It is whether the version that arrives early would actually be what you need.",
    prompts: [
      "What are you rushing that needs more time to become what it should be?",
      "How would your behavior change if you trusted the timing more?",
      "What is the difference between patience and avoidance in your current situation?",
    ],
  },
  {
    id: "expansion",
    name: "Expansion",
    keyword: "Growing beyond edges",
    category: "Direction",
    shortMeaning:
      "The moment when your current container feels too small for who you're becoming.",
    deeperMeaning:
      "Expansion is the discomfort of outgrowing what once fit. The role, the identity, the relationship, the definition of what is possible — all of it can become too small without you noticing at first. This card signals that you are at the edge of a larger version of yourself. The fear is natural. So is the pull. What you are being asked to let go of is not your foundation — it is your ceiling.",
    prompts: [
      "What have you outgrown that you are still trying to fit into?",
      "What would a larger version of your life look like?",
      "What fear is keeping you in a container that no longer holds you?",
    ],
  },
  {
    id: "craft",
    name: "Craft",
    keyword: "The devotion to doing well",
    category: "Direction",
    shortMeaning:
      "Caring about the work itself, not just the outcome it produces.",
    deeperMeaning:
      "Craft is the love of process over prize. It is the decision to do something well because doing it well matters, regardless of who notices. In a world obsessed with results and visibility, craft is a quiet rebellion. This card asks whether you have been rushing the work, outsourcing your standards, or measuring everything by output. The return to craft is a return to integrity — and often, it is the very thing that produces the best outcomes anyway.",
    prompts: [
      "Where have you been prioritizing speed over quality?",
      "What would it look like to truly care about how you do this, not just that it gets done?",
      "What work have you done that you are proud of simply because of how you did it?",
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    keyword: "The force that shapes",
    category: "Direction",
    shortMeaning:
      "External expectation, internal drive. Can forge or fracture.",
    deeperMeaning:
      "Pressure is not inherently harmful — it is the force that forges. But it must be matched by support, recovery, and a sense of meaning. Without those, pressure becomes stress, and stress becomes breakdown. This card asks you to look honestly at the pressure you are under: how much is chosen, how much is inherited, and whether the container around you is strong enough to hold what is being asked. If not, something needs to change before you do.",
    prompts: [
      "How much of the pressure you feel is chosen, and how much is inherited?",
      "What is the pressure producing — and is it worth the cost?",
      "What support would make this pressure feel sustainable instead of crushing?",
    ],
  },
  {
    id: "timing",
    name: "Timing",
    keyword: "When to act, when to wait",
    category: "Direction",
    shortMeaning:
      "The elusive sense of right moment. Rushing and delaying both have costs.",
    deeperMeaning:
      "Timing is one of the most underrated skills in any pursuit. Too early, and the ground isn't ready. Too late, and the window has closed. This card invites a different kind of attention — not to what you want to do, but to when the doing would land. Sometimes the bravest act is to wait. Sometimes the most costly is to delay. The wisdom is knowing which moment you are in.",
    prompts: [
      "Are you rushing something that needs more time, or delaying something that is ready now?",
      "What would it mean to trust your sense of timing more?",
      "What signals is the situation giving you about whether the moment is right?",
    ],
  },
  {
    id: "visibility",
    name: "Visibility",
    keyword: "Being seen, being found",
    category: "Direction",
    shortMeaning:
      "The tension between wanting to be known and wanting to stay safe.",
    deeperMeaning:
      "Visibility is a paradox. We need to be seen to matter, to connect, to create impact. But being seen also means being judged, misunderstood, and shaped by other people's expectations. This card arrives when you are navigating that tension — perhaps hiding too much, perhaps exposing too much, or perhaps unsure which would serve you. The question is not whether to be visible. It is what kind of visibility actually aligns with who you are.",
    prompts: [
      "What part of you wants to be seen more clearly?",
      "What part of you wants to stay hidden — and why?",
      "What would authentic visibility look like for you, not performative exposure?",
    ],
  },
  {
    id: "next-move",
    name: "Next Move",
    keyword: "The step that changes everything",
    category: "Direction",
    shortMeaning:
      "The single action that shifts the whole pattern. Often smaller than you think.",
    deeperMeaning:
      "The next move is rarely the biggest one. It is usually the one you have been avoiding because it feels too small to matter or too simple to be the answer. But patterns shift at single points of intervention — one conversation, one boundary, one choice to stop or start. This card invites you to stop waiting for the grand gesture and to identify the small, precise action that would change the shape of what comes next.",
    prompts: [
      "What is the smallest action that would shift the pattern you're in?",
      "What have you been avoiding because it feels too small to matter?",
      "If you had to act today, what is the one thing you already know you should do?",
    ],
  },
];
