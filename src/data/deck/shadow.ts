import type { OracleCard } from "./types";

// Modobeam — Shadow & Healing deck
// A deeper inner-world set focused on unconscious patterns, emotional
// loops, and the quiet psychology of self-protection. Tone: compassionate
// and emotionally precise, never clinical or mystical.

export const SHADOW_CARDS: OracleCard[] = [
  {
    id: "avoidance",
    name: "Avoidance",
    keyword: "What you keep walking around",
    category: "Shadow",
    shortMeaning:
      "There's something you've been moving around for a while. The detour is becoming the road.",
    deeperMeaning:
      "Avoidance is rarely loud. It looks like staying busy, changing the subject, scrolling past, or filling the silence with anything else. It works — until the cost of not facing it grows larger than the discomfort of facing it. This card asks you to name the thing, even if you do nothing about it yet. Naming is the first crack in the wall.",
    prompts: [
      "What have you been working hard not to think about?",
      "What would change if you let yourself feel this for ten minutes?",
      "What is the smallest honest sentence you could say about it?",
    ],
  },
  {
    id: "shame",
    name: "Shame",
    keyword: "The story that says you're the problem",
    category: "Shadow",
    shortMeaning:
      "Not 'I did something bad' — but 'something is wrong with me.' Shame collapses behavior into identity.",
    deeperMeaning:
      "Shame thrives in silence and distorts in private. It takes one moment, one mistake, one need, and tells you it means something fundamental about who you are. The work is not to argue with shame logically — it doesn't listen to logic. The work is to bring it into the light, gently, and let it lose some of its weight by being witnessed.",
    prompts: [
      "What part of yourself do you keep hidden because you believe it makes you unlovable?",
      "Whose voice does the shame sound like — and is it actually yours?",
      "What would it feel like to be human about this instead of perfect?",
    ],
  },
  {
    id: "self-protection",
    name: "Self-Protection",
    keyword: "The walls that once kept you safe",
    category: "Shadow",
    shortMeaning:
      "What you built to survive earlier is still running, even when the threat is gone.",
    deeperMeaning:
      "Every defense you have was once intelligent. The withdrawal, the sharp edge, the joke that deflects, the over-explaining — all of it kept something tender alive. The question isn't whether the protection was wise. It was. The question is whether it still serves you, or whether the wall now keeps out the very thing you need.",
    prompts: [
      "What protective pattern shows up automatically — and what is it still trying to keep safe?",
      "Where is the wall now blocking what you actually want to let in?",
      "What would feel different if you let one inch of guard drop?",
    ],
  },
  {
    id: "self-abandonment",
    name: "Self-Abandonment",
    keyword: "Leaving yourself to be chosen",
    category: "Shadow",
    shortMeaning:
      "Quietly turning away from your own needs to keep someone, something, or some version of yourself intact.",
    deeperMeaning:
      "Self-abandonment isn't dramatic — it's the small daily act of overriding what you actually feel because you've decided someone else's comfort matters more. Over time it becomes invisible to you. You stop knowing what you want because you've stopped asking. This card is a quiet alarm. Coming back to yourself doesn't require a confrontation. It starts with one honest answer to one small question.",
    prompts: [
      "Where have you stopped asking yourself what you actually want?",
      "Who or what are you abandoning yourself for — and is it worth the trade?",
      "What is one small way you could stay with yourself today?",
    ],
  },
  {
    id: "projection",
    name: "Projection",
    keyword: "What you see in them is partly you",
    category: "Shadow",
    shortMeaning:
      "Strong reactions to others often point to something unfinished inside you.",
    deeperMeaning:
      "Projection isn't about being wrong about other people — they may genuinely be doing what you see. But the intensity of your reaction is information. The traits that most disturb you in others are often the ones you've worked hardest to disown in yourself. The traits that move you most are sometimes the ones you've forgotten you have. This card asks you to look at what your reaction is showing you about you.",
    prompts: [
      "Whose behavior is currently taking up too much space in your mind?",
      "What does your reaction reveal about what you fear or long for in yourself?",
      "What part of you is asking to be acknowledged through this irritation or longing?",
    ],
  },
  {
    id: "fear",
    name: "Fear",
    keyword: "The signal beneath the freeze",
    category: "Shadow",
    shortMeaning:
      "Not always a warning. Sometimes a memory wearing the clothes of the present.",
    deeperMeaning:
      "Fear is honest about its presence and unreliable about its source. It tells you something matters, but not always what to do. The work is not to override fear or obey it blindly — but to listen to what it is actually pointing at. Sometimes it's protecting you. Sometimes it's repeating an old story. Learning the difference is one of the quieter forms of growth.",
    prompts: [
      "What is the fear actually trying to protect?",
      "Is this fear from now, or from before?",
      "What would you do if the fear stayed but you moved anyway?",
    ],
  },
  {
    id: "tenderness",
    name: "Tenderness",
    keyword: "The soft place under the armor",
    category: "Shadow",
    shortMeaning:
      "What you've been calling weakness might be the most truthful part of you.",
    deeperMeaning:
      "Tenderness is not fragility. It is the willingness to feel without armor — to let something matter, to be moved, to want what you want without apology. Many people learn early that tenderness is dangerous and harden into something that survives but doesn't quite live. This card invites you to let a little softness back in, on purpose, with the part of you that has earned the right to be careful.",
    prompts: [
      "Where have you hardened in a place that wants to stay soft?",
      "What do you treat as weakness in yourself that is actually depth?",
      "Who or what could you let yourself be tender with today?",
    ],
  },
  {
    id: "grief",
    name: "Grief",
    keyword: "Love with nowhere to go",
    category: "Shadow",
    shortMeaning:
      "Not only for what is lost. Also for what was never given, never said, never possible.",
    deeperMeaning:
      "Grief doesn't follow a schedule and doesn't always arrive in the shape you expect. It can come for the future you imagined, the version of someone you needed, the years you spent waiting. It needs space, not solutions. This card asks you not to fix the grief, but to let it move — to honor it as the proof that something mattered, and to let it slowly change shape over time.",
    prompts: [
      "What loss are you still carrying that you've never fully named?",
      "What did you need from this that you didn't get?",
      "What would it look like to let yourself grieve this without rushing to be okay?",
    ],
  },
  {
    id: "denial",
    name: "Denial",
    keyword: "The truth you almost see",
    category: "Shadow",
    shortMeaning:
      "Knowing and not knowing at the same time. The mind protecting you from what would change everything.",
    deeperMeaning:
      "Denial is rarely a lie you tell yourself — it's a softening of the edges of a truth you can't yet hold. It serves a purpose: it gives you time. But there comes a point where the cost of not seeing becomes greater than the cost of seeing. This card arrives near that point. You probably already know what's true. This is the moment to let yourself say it.",
    prompts: [
      "What do you already know that you've been refusing to fully see?",
      "What would change if you let yourself believe what you suspect?",
      "What part of you is not yet ready — and what does that part need first?",
    ],
  },
  {
    id: "repetition",
    name: "Repetition",
    keyword: "The same chapter, new cover",
    category: "Shadow",
    shortMeaning:
      "Different people, different settings, same dynamic. The pattern is asking to be seen.",
    deeperMeaning:
      "When the same thing keeps happening, it's tempting to blame the circumstances. But repetition is rarely a coincidence — it's the unconscious returning to an old wound, hoping this time it will end differently. The pattern doesn't break by trying harder inside it. It breaks when you finally see what it's been pointing to all along, and choose to meet that part of yourself directly.",
    prompts: [
      "What pattern keeps showing up across different chapters of your life?",
      "What is this loop trying to make you finally face?",
      "What would it mean to stop hoping for a different ending and write a different beginning?",
    ],
  },
  {
    id: "numbness",
    name: "Numbness",
    keyword: "The quiet after too much",
    category: "Shadow",
    shortMeaning:
      "Not the absence of feeling — the body's protective hush when feeling has been too much for too long.",
    deeperMeaning:
      "Numbness is intelligent. It is what happens when the system has been overwhelmed and learned that staying online costs too much. It is not a flaw to fix in a weekend. It is a slow thaw, asked for gently, with no demand for it to happen on a schedule. This card is permission to start small — one feeling, one breath, one moment of letting something in.",
    prompts: [
      "What did you have to stop feeling in order to keep going?",
      "What is one small thing that still moves you, even faintly?",
      "What would gentle reentry into your own feeling look like today?",
    ],
  },
  {
    id: "overcompensation",
    name: "Overcompensation",
    keyword: "Doing more to feel enough",
    category: "Shadow",
    shortMeaning:
      "The achievement, the giving, the over-effort — covering a quieter belief that you're somehow short.",
    deeperMeaning:
      "Overcompensation is exhausting because it's trying to solve at the surface what is actually a story underneath. No amount of external proof will quiet a voice that says you're not enough — because the voice was never about the evidence. This card asks you to look at what you're trying to prove, and to whom, and to consider what would happen if you let yourself rest in being ordinary for a while.",
    prompts: [
      "What are you working overtime to prove — and to whom?",
      "What would happen if you let yourself be average at this?",
      "What deeper belief is the over-effort trying to outrun?",
    ],
  },
  {
    id: "hypervigilance",
    name: "Hypervigilance",
    keyword: "Always reading the room",
    category: "Shadow",
    shortMeaning:
      "The exhausting work of scanning for danger that may have already passed.",
    deeperMeaning:
      "Hypervigilance is what happens when you learned early that safety couldn't be assumed. The radar got installed for good reason — and it never quite turned off. The cost is that you read every shift in tone, every silence, every change in someone's face, and your nervous system pays a tax for it. This card is not asking you to drop the awareness. It is asking whether some of the rooms you're in might actually be safe enough to soften in.",
    prompts: [
      "Where are you scanning for danger that probably isn't there anymore?",
      "What did you learn early that made vigilance feel necessary?",
      "Where might it be safe enough to let your guard down a little?",
    ],
  },
  {
    id: "inner-child",
    name: "Inner Child",
    keyword: "The younger one still inside",
    category: "Shadow",
    shortMeaning:
      "The part of you that formed before you had words for it. Still here, still asking.",
    deeperMeaning:
      "The inner child is not a metaphor — it's the felt memory of who you were before you learned to manage yourself. That younger version still carries the unmet needs, the missed reassurances, the moments no one stayed for. The adult version of you can do something almost no one else can: turn around and stay. This card is an invitation to be the steady presence the younger you needed.",
    prompts: [
      "What did the younger version of you most need to hear that no one said?",
      "What is that part of you currently asking for, in disguise?",
      "How could you offer yourself today what you needed back then?",
    ],
  },
  {
    id: "softness",
    name: "Softness",
    keyword: "Strength that doesn't need to brace",
    category: "Shadow",
    shortMeaning:
      "The kind of power that doesn't have to harden to hold itself together.",
    deeperMeaning:
      "Softness is often confused with weakness, but it is one of the most demanding forms of strength. It requires a self that is steady enough not to need armor. It requires trust — in yourself, in the moment, in your ability to handle what you might feel. This card invites you to test, in one small place, whether you can be strong without being hard.",
    prompts: [
      "Where could you hold this with less grip and still be okay?",
      "What would softness ask of you that hardness wouldn't?",
      "Who in your life would meet a softer version of you well?",
    ],
  },
  {
    id: "repair",
    name: "Repair",
    keyword: "Coming back after the rupture",
    category: "Shadow",
    shortMeaning:
      "The relationship is not defined by the break, but by what you both do after it.",
    deeperMeaning:
      "Repair is one of the most underrated skills in any relationship — including the one with yourself. The disappointment, the misattunement, the missed bid for connection — these are not the failures. The failure is the silence that follows when no one circles back. This card asks where a small, honest return could change the shape of something. Sometimes a single sentence is the whole repair.",
    prompts: [
      "Where is a small repair waiting to be made — with someone else, or with yourself?",
      "What sentence has been sitting in your chest, asking to be said?",
      "What would it mean to come back instead of let it stand?",
    ],
  },
  {
    id: "acceptance",
    name: "Acceptance",
    keyword: "The end of the argument with reality",
    category: "Shadow",
    shortMeaning:
      "Not approval, not surrender. The exhausted relief of letting it be what it is.",
    deeperMeaning:
      "Acceptance is often misunderstood as agreeing with what happened, or giving up on change. It is neither. It is the simple act of stopping the inner war with what is already true. From acceptance, real choice becomes possible. From resistance, only repetition. This card asks where you've been spending energy fighting a fact that has already finished happening.",
    prompts: [
      "What are you still arguing with that has already happened?",
      "What would change if you stopped trying to make this be different than it is?",
      "What becomes possible from acceptance that wasn't possible from resistance?",
    ],
  },
  {
    id: "exposure",
    name: "Exposure",
    keyword: "Being seen with the mask off",
    category: "Shadow",
    shortMeaning:
      "The vulnerability of letting yourself be known without the usual protections.",
    deeperMeaning:
      "Exposure is the moment when the version you usually present and the version you actually are stop matching, in front of someone. It can feel like falling. It can also be the first time you feel actually met. This card arrives near a threshold of being known — and asks whether you can let yourself stay in the room while the truer version of you comes into view.",
    prompts: [
      "What are you afraid would happen if someone really saw this?",
      "Where is the gap between the version of you on display and the version underneath?",
      "Who has earned the right to see the truer one?",
    ],
  },
  {
    id: "hidden-need",
    name: "Hidden Need",
    keyword: "The thing you won't admit you want",
    category: "Shadow",
    shortMeaning:
      "Underneath the irritation, the longing, the over-functioning — a need you haven't let yourself name.",
    deeperMeaning:
      "Hidden needs don't disappear because you ignore them. They show up sideways: as resentment, as exhaustion, as a sharper edge than you meant. The work is not to suddenly demand them — it is first to let yourself know what they are. Naming a need to yourself is not the same as asking for it. But it is the door without which no honest ask is possible.",
    prompts: [
      "What do you need that you haven't let yourself fully name?",
      "What story have you told yourself about why you can't have it?",
      "What would it feel like to admit the need, even if only to yourself today?",
    ],
  },
  {
    id: "self-trust",
    name: "Self-Trust",
    keyword: "Believing your own knowing",
    category: "Shadow",
    shortMeaning:
      "The slow rebuilding of faith in your own perception after years of being told otherwise.",
    deeperMeaning:
      "Self-trust is rebuilt the same way it was eroded — one moment at a time. Each time you honor what you actually feel instead of overriding it, the inner ground gets a little firmer. Each time you keep a small promise to yourself, the part of you that has been waiting to be trusted exhales. This card is a quiet vote for your own knowing.",
    prompts: [
      "Where is your knowing telling you something you've been talking yourself out of?",
      "What small promise to yourself could you keep this week?",
      "Whose voice have you been listening to over your own?",
    ],
  },
  {
    id: "witnessing",
    name: "Witnessing",
    keyword: "Seeing yourself without judgment",
    category: "Shadow",
    shortMeaning:
      "The quiet, honest looking. Not fixing, not flinching — just being with what's true.",
    deeperMeaning:
      "Witnessing is one of the most underrated forms of healing. It is the act of seeing yourself clearly, including the parts that are hard to look at, without immediately demanding they change. So much of suffering is the friction of being unseen — even by yourself. This card invites you to spend a few minutes simply noticing what's there, with the same patience you'd offer someone you love.",
    prompts: [
      "What part of your current experience needs to be witnessed before it can shift?",
      "Where have you been judging yourself when you needed to be seen instead?",
      "What would change if you stopped trying to fix and just stayed with what's true?",
    ],
  },
  {
    id: "survival-mode",
    name: "Survival Mode",
    keyword: "Getting through, not being well",
    category: "Shadow",
    shortMeaning:
      "The state of pure function. You're standing — but there's no room left for living.",
    deeperMeaning:
      "Survival mode keeps you alive when life demands more than you have. The problem is that it can become the default long after the crisis is over. The body forgets there's another setting. This card is a check-in: is this still necessary, or has it become the way you live? The exit isn't a grand reset. It's giving yourself permission to want more than function — and starting somewhere small.",
    prompts: [
      "Are you still in survival mode out of necessity, or has it become a habit?",
      "What would it look like to live, not just cope, in one small area?",
      "What is one need beyond function that you could honor this week?",
    ],
  },
  {
    id: "release",
    name: "Release",
    keyword: "Letting it move through",
    category: "Shadow",
    shortMeaning:
      "Not pushing it away — letting what was held finally have somewhere to go.",
    deeperMeaning:
      "Release is the natural completion of something that has been carried for too long. It is rarely as dramatic as the body fears — usually it looks like a long exhale, a few tears, a sentence finally said out loud. What was stored gets metabolized. What was frozen begins to move. This card asks what you have been holding, and whether you are ready to let your body finish a feeling instead of suspending it.",
    prompts: [
      "What feeling have you been carrying that has nowhere to land?",
      "What does your body need to finish saying or expressing?",
      "What would it feel like to stop holding this and let it move through you?",
    ],
  },
  {
    id: "integration",
    name: "Integration",
    keyword: "Bringing the parts back together",
    category: "Shadow",
    shortMeaning:
      "Healing isn't erasing what happened — it's weaving it into the larger story of who you are.",
    deeperMeaning:
      "Integration is the slow work of taking what was once survived and making it part of you, without it owning you. The hard chapter doesn't disappear. It becomes context. It becomes wisdom. It becomes one of the reasons you can recognize what others are going through. This card honors the patient stitching together of a self that includes — rather than denies — what it has lived.",
    prompts: [
      "What part of your story have you been keeping at arm's length?",
      "What would it mean to let this experience belong to your life rather than haunt it?",
      "What have you learned that you would never have chosen to learn?",
    ],
  },
  {
    id: "healing",
    name: "Healing",
    keyword: "Not fixing — becoming whole",
    category: "Shadow",
    shortMeaning:
      "Slower than you want, less linear than you hoped. Real, even on the days it doesn't feel like it.",
    deeperMeaning:
      "Healing is not a destination you arrive at and stay. It moves in spirals. You'll meet the same wound at deeper levels, and each time you'll have more capacity to hold it. The signs are quiet: you respond instead of react. You stay with yourself longer. You can be in your life a little more often. This card honors the unspectacular, sacred work you're doing — and reminds you that you're further along than the harsh inner voice will admit.",
    prompts: [
      "Where are you further along than you've given yourself credit for?",
      "What is one quiet sign that healing is happening, even slowly?",
      "What would it mean to trust the process even on the days it doesn't show?",
    ],
  },
];
