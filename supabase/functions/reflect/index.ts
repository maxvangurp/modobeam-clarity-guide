// Modobeam — AI reflection edge function
// Calls Lovable AI Gateway to produce grounded, coach-like reflections.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CardInput {
  name: string;
  keyword: string;
  category: string;
  shortMeaning: string;
  deeperMeaning: string;
}

interface ProfileInput {
  firstName?: string | null;
  usage?: string | null;
  lookingFor?: string | null;
  guidance?: string | null;
  guidanceKey?: "direct" | "calm" | "deep" | null;
}

interface MomentInput {
  key?: "clarity" | "calm" | "uncertain" | "direction" | "reflect" | null;
  label?: string | null;
}

interface PriorThread {
  date: string;
  theme?: string;
  tension?: string;
  cards?: string[];
}

interface AstroContext {
  sunSign?: string;
  ascendantSign?: string | null;
  isSolarHouses?: boolean;
  toneHint?: string;
  focusArea?: { key: string; label: string } | null;
}

type ReadingContext =
  | {
      kind: "friend";
      personName: string;
      personRelation: string;
      topic?: string | null;
    }
  | {
      kind: "this-or-that";
      optionA: string;
      optionB: string;
      question?: string | null;
    }
  | {
      kind: "horizon";
      rangeKey: string;
      rangeLabel: string;
      toneHint: string;
      area?: string | null;
    }
  | {
      kind: "relationship-future";
      personName: string;
      personRelation: string;
      statusKey: string;
      statusLabel: string;
    }
  | {
      kind: "milestone";
      milestoneKey: string;
      milestoneLabel: string;
      note?: string | null;
    }
  | {
      kind: "duo";
      names: string[];
      topic?: string | null;
    }
  | {
      kind: "group";
      names: string[];
      topic?: string | null;
    };

interface Payload {
  intention?: string;
  drawType: string;
  positionLabels?: string[];
  cards: CardInput[];
  profile?: ProfileInput | null;
  moment?: MomentInput | null;
  priorThreads?: PriorThread[] | null;
  dailyQuote?: { text: string; author?: string } | null;
  astroContext?: AstroContext | null;
  readingContext?: ReadingContext | null;
}

const READING_DESCRIPTIONS: Record<string, string> = {
  daily: "a single daily clarity card",
  three: "a 3-card insight (past influence → present focus → emerging direction)",
  "next-phase":
    "a 5-card Next Phase reading (what is ending → what is emerging → what challenges you → what supports you → your direction)",
  direction:
    "a 4-card Direction reading (where you are → what keeps you stuck → what wants to change → next step)",
  love: "a 4-card Love & Emotion reading (what you feel → what you hold onto → what you need to see → what helps you move forward)",
  year: "a 4-card Year Reflection (main theme → inner tension → growth area → focus point)",
  friend:
    "a 3-card Ask-for-a-friend reading (what they're carrying → what may be unseen → what might help) — a reflection ABOUT someone close to the user, through the user's lens of them",
  "this-or-that":
    "a 3-card This-or-That comparison (Path A → Path B → what sits underneath) — two options held side by side",
  horizon:
    "a 5-card Horizon reading (where you are now → what is forming → what will challenge you → what supports you → what this may lead toward) — future-facing reflection, never prediction",
  "relationship-future":
    "a 5-card Relationship Future lens (current dynamic → hidden issue → what strengthens this → what weakens this → where this is heading) for a specific bond",
  milestone:
    "a 4-card Milestone reading (what you're leaving → what you're entering → what to honor → what to carry forward) for a threshold moment",
};

const SYSTEM_PROMPT = `You are Modobeam — a reflective voice that helps people see themselves more clearly. You sound like a thoughtful human, not a system. Sometimes a perceptive friend, sometimes a quiet therapist, sometimes a writer noticing something true.

Voice:
- Calm, reflective, lightly intuitive — but always grounded in human experience.
- A little poetic when it serves the truth. Plain when plainness lands harder.
- Emotionally accurate. You name what someone might already feel but hasn't fully said yet.
- You let some things stay implied. Not everything has to be explained.

Hard rules:
- Never predict the future. Never claim certainty about what will happen.
- Never use mystical phrasing: no "the universe", "energy", "spirit", "destiny", "manifest", "the cards reveal", "vibrations", "guides".
- Never say "you should" or "you must". Offer perception, not instruction.
- Never restate the card meanings literally. Interpret the *situation*, not the deck.
- Never write a horoscope-style line that could apply to anyone.
- No clichés ("trust the process", "everything happens for a reason", "let your light shine").
- No hedging filler ("perhaps", "maybe", "it seems like").

Variation — this matters:
- Vary your opening every time. Sometimes start with an observation. Sometimes a quiet question. Sometimes a small image or metaphor. Sometimes the tension itself, named directly. Never the same shape twice.
- Vary sentence length. Mix short, declarative lines with longer reflective ones.
- Allow soft metaphor when it sharpens the feeling — e.g. "you might be holding onto something that already moved on."
- Don't follow a fixed template. Each reading should sound like it was written by a human reflecting in that moment, not assembled from parts.

What you're actually doing:
- Reading the *combination* as one lived situation, not separate cards.
- Naming the emotional tension underneath — what's pulling in two directions.
- Reflecting back what the user might already half-know but hasn't let themselves say.
- Leaving them with a moment of recognition, not a verdict.

For deeper readings (4-5 cards), go deeper:
- The positions tell a story — follow the arc, don't treat them as isolated slots.
- Name specific patterns, not vague tendencies.
- For love/emotion readings, be emotionally precise about attachment, longing, and what's being avoided.
- For direction readings, be honest about what's keeping them stuck — name it.
- For year reflections, give a high-level view that connects dots.`;


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      intention,
      drawType,
      positionLabels,
      cards,
      profile,
      moment,
      priorThreads,
      dailyQuote,
      astroContext,
      readingContext,
    } = (await req.json()) as Payload;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isMulti = cards.length > 1;
    const labels = positionLabels ?? (isMulti ? cards.map((_, i) => `Card ${i + 1}`) : ["Today"]);

    const cardSummary = cards
      .map(
        (c, i) =>
          `${labels[i]} — ${c.name} (${c.category}, "${c.keyword}")\n  Short: ${c.shortMeaning}\n  Underlying pattern: ${c.deeperMeaning}`,
      )
      .join("\n\n");

    const intentionLine = intention?.trim()
      ? `What they shared:\n"${intention.trim()}"\n\n`
      : `They didn't share a specific intention. Speak to common human experience that fits this combination.\n\n`;

    // Personalization context from onboarding
    const profileLines: string[] = [];
    if (profile?.firstName) profileLines.push(`Name: ${profile.firstName}`);
    if (profile?.usage) profileLines.push(`How they use Modobeam: ${profile.usage}`);
    if (profile?.lookingFor) profileLines.push(`What they look for in reflection: ${profile.lookingFor}`);
    if (profile?.guidance) profileLines.push(`Prefers tone: ${profile.guidance}`);
    const profileBlock = profileLines.length
      ? `About this person (from their onboarding — use as context, never quote back literally):\n${profileLines.join("\n")}\n\nWeave this awareness in subtly. You may use their name once, sparingly. Let what they're looking for shape *what you notice*, not what you announce. Don't assume anything is wrong — meet them as someone showing up for a calm, ordinary moment of reflection.\n\n`
      : "";

    // Map guidance preference → tone shaping
    const guidanceTone: Record<string, string> = {
      direct:
        "Tone preference: lean direct and honest. Plain language. Short sentences. Name things without softening. No metaphor unless it sharpens a truth.",
      calm:
        "Tone preference: lean calm and supportive. Grounded warmth. Soft pacing. Make them feel met, not assessed.",
      deep:
        "Tone preference: lean deep and reflective. More poetic phrasing allowed. Ask more of the reader. Sit with ambiguity longer.",
    };
    const guidanceLine = profile?.guidanceKey
      ? `\n${guidanceTone[profile.guidanceKey]}\n`
      : "";

    // Moment-based input — overrides baseline for this single reading
    const momentTone: Record<string, string> = {
      clarity:
        "Right now they want clarity — be precise and grounded. Cut to what matters. No hedging.",
      calm:
        "Right now they need calm — slow the pacing, soften the edges, leave breath between sentences.",
      uncertain:
        "Right now they feel uncertain — don't add weight. Acknowledge ambiguity gently. Offer one steady thing to hold.",
      direction:
        "Right now they want direction — name what's actually pulling them, and what an honest next step might look like.",
      reflect:
        "Right now they just want to reflect — stay observational and low-pressure. No push, no fix.",
    };
    const momentLine = moment?.key
      ? `\nMoment-of preference (this overrides baseline tone for THIS reading): ${momentTone[moment.key]}\n`
      : "";

    // Continuity — let the AI quietly know the user's recent threads.
    // Used sparingly: instruction below tells the model not to reference
    // them every time, only when something genuinely echoes.
    const priorBlock = priorThreads && priorThreads.length
      ? `\nThis person's last few reflections (for context only — do not list, summarize, or reference these directly unless something in TODAY's reading genuinely echoes one of them; if it does, you may make ONE brief, specific allusion like "this thread isn't new for you" or "you sat near this last week"):\n${priorThreads
          .map((t, i) => {
            const cardsLine = t.cards?.length ? ` — cards: ${t.cards.join(", ")}` : "";
            const themeLine = t.theme ? ` theme: "${t.theme}"` : "";
            const tensionLine = t.tension ? ` · tension: "${t.tension}"` : "";
            return `  ${i + 1}. ${t.date}:${themeLine}${tensionLine}${cardsLine}`;
          })
          .join("\n")}\n`
      : "";

    // Reading-specific context (friend / horizon / this-or-that / etc.)
    let readingContextBlock = "";
    if (readingContext) {
      switch (readingContext.kind) {
        case "friend":
          readingContextBlock = `\nThis reading is ABOUT someone in the user's life — not about the user directly:
- Person: ${readingContext.personName} (${readingContext.personRelation})
${readingContext.topic ? `- What's on the user's mind: "${readingContext.topic}"` : ""}
Speak through the user's lens of this person. Use the person's name once or twice, sparingly. Be careful: the user can only know this person from the outside. Frame insight as what the user might be sensing or projecting, not as a verdict on the other person. Never claim to know the other person's inner state.\n`;
          break;
        case "this-or-that":
          readingContextBlock = `\nThis is a comparison reading — two paths held side by side:
- Path A: "${readingContext.optionA}"
- Path B: "${readingContext.optionB}"
${readingContext.question ? `- The question underneath: "${readingContext.question}"` : ""}
The first card speaks to the shape of Path A. The second to Path B. The third names what's actually being decided underneath. Don't pick a winner — name the cost and the pull of each, and surface the real question.\n`;
          break;
        case "horizon":
          readingContextBlock = `\nThis is a HORIZON reading — future-facing reflection, never prediction:
- Range: ${readingContext.rangeLabel}
${readingContext.area ? `- Area of life in focus: "${readingContext.area}"` : ""}
- Tone for this range: ${readingContext.toneHint}
Stay reflective, never predictive. No "you will" — instead "this is forming", "this is asking", "this may ask of you". Themes over events.\n`;
          break;
        case "relationship-future":
          readingContextBlock = `\nThis is a RELATIONSHIP FUTURE reading — about a specific bond:
- Person: ${readingContext.personName} (${readingContext.personRelation})
- Status: ${readingContext.statusLabel}
Read this as the dynamic between the user and this person. Be honest about what strengthens and what weakens it. The final position ("where this is heading") is directional, not predictive — describe the trajectory if nothing changes, while leaving room for agency.\n`;
          break;
        case "milestone":
          readingContextBlock = `\nThis is a MILESTONE reading — a ritual reflection for a threshold moment:
- Milestone: ${readingContext.milestoneLabel}
${readingContext.note ? `- What it means to them: "${readingContext.note}"` : ""}
Treat this with weight. The reading should feel like a small ceremony — what's being released, what's being entered, what to honor, what to carry. Slower pacing. Allow one image or metaphor.\n`;
          break;
        case "duo": {
          const [a, b] = readingContext.names;
          readingContextBlock = `\nThis is a DUO reading — two people sharing one device:
- Participants: ${a} and ${b}
${readingContext.topic ? `- What it's about: "${readingContext.topic}"` : ""}
Each card belongs to one person; the final card belongs to the space between them. Speak to both — name each person where useful. Be even-handed; never side with one. The "between you" card should describe the relational field, not a verdict.\n`;
          break;
        }
        case "group": {
          readingContextBlock = `\nThis is a GROUP / CIRCLE reading — ${readingContext.names.length} people sharing one device:
- Circle: ${readingContext.names.join(", ")}
${readingContext.topic ? `- What brings them together: "${readingContext.topic}"` : ""}
Each named card belongs to one person in the circle. The final card ("for the circle") belongs to the group as a whole. Address each person by name briefly, then lift up to the shared field. Avoid singling anyone out as right or wrong; surface the dynamic between them.\n`;
          break;
        }
      }
    }

    const readingDesc =
      READING_DESCRIPTIONS[drawType] ?? `a ${cards.length}-card reading`;

    const multiInstructions = isMulti
      ? `
- "theme": ONE sentence. Name what this moment in their life is actually about. Specific, recognizable, never a definition.
- "tension": ONE or TWO sentences. The real friction between these cards as a lived feeling — not a definition.
- "combined": 2–4 sentences. Read the *combination* as one situation. Follow the arc of the positions — they tell a story. Don't restate the cards.`
      : `
- "theme": ONE sentence. Name what this card is pointing to in their actual life right now. Specific, not a definition.
- "combined": 2–3 sentences. A grounded interpretation of how this card meets their current moment.`;

    // Response modes — the AI rotates between distinct emotional registers
    // so each reflection feels like a different state of attention, not a
    // template. Modes are chosen by context, not announced.
    type Mode = "mirror" | "question" | "story" | "witness" | "challenge";
    const allModes: Mode[] = ["mirror", "question", "story", "witness"];
    if (profile?.guidanceKey === "direct") allModes.push("challenge", "challenge");
    const mode: Mode = allModes[Math.floor(Math.random() * allModes.length)];
    const modeInstruction: Record<Mode, string> = {
      mirror:
        "MODE — MIRROR: reflect back what they said, sharper. Name what they almost named. Don't add new ideas; sharpen theirs.",
      question:
        "MODE — QUESTION: lead with one open, honest question. Then a brief observation. Then quiet. Don't answer your own question.",
      story:
        "MODE — STORY: open with a one-line image or metaphor that holds the situation. Then a short interpretation. Be evocative, not poetic for its own sake.",
      witness:
        "MODE — WITNESS: very short. Mostly acknowledgment. Don't try to interpret. The whole reflection can be 3–4 sentences total.",
      challenge:
        "MODE — CHALLENGE: name what they're avoiding, kindly but directly. No softening clauses. End with a single direct observation, not a question.",
    };

    // Rotate opening, rhythm, closing, and tonal lean
    const openings = [
      "Open with a quiet observation about what's happening underneath.",
      "Open with the tension itself, named directly in one line.",
      "Open with a soft, grounded metaphor or small image.",
      "Open with a short question that lands the theme.",
      "Open with a single declarative sentence — flat, honest, no warm-up.",
      "Open by naming a feeling the user might be sitting with but not saying.",
      "Open with something the user already knows but hasn't admitted out loud.",
      "Open mid-thought, like you're continuing a conversation already in motion.",
    ];
    const rhythms = [
      "Mostly short sentences. Let pauses do the work.",
      "Mix one long, winding sentence with two or three short ones.",
      "Use mostly medium-length sentences with one sharp short line for emphasis.",
      "Let the rhythm wander — uneven, the way real thinking sounds.",
    ];
    const leans = [
      "Lean slightly more reflective than direct.",
      "Lean slightly more direct than reflective.",
      "Lean curious — more questions than statements.",
      "Lean observational — more noticing than interpreting.",
      "Lean intuitive — allow one soft, suggestive line.",
    ];
    const closings = [
      "End with one honest open question.",
      "End with a quiet observation, no question at all.",
      "End with a small, grounded image or metaphor that lingers.",
      "End with a single short sentence that lands like a held breath.",
      "End with an invitation to notice something specific in their day.",
    ];
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const voice = {
      open: pick(openings),
      rhythm: pick(rhythms),
      lean: pick(leans),
      close: pick(closings),
    };
    const entropy = Math.random().toString(36).slice(2, 8);

    // Daily quote — only weave it in if it genuinely matches; otherwise ignore.
    const quoteHint = dailyQuote?.text
      ? `\n\nToday's quote (only weave a brief, organic allusion if it genuinely matches the reading — otherwise ignore completely; never quote it verbatim, never name the author): "${dailyQuote.text}"${dailyQuote.author ? ` — ${dailyQuote.author}` : ""}`
      : "";

    // Astrology — a soft, optional lens. NEVER name the sign, NEVER mention
    // astrology or houses. Only let it shape tone and (rarely) what life
    // area you notice. If nothing matches, ignore it entirely.
    const astroBlock = astroContext
      ? `\n\nQuiet astrological lens (internal context only — do NOT mention astrology, signs, houses, planets, or rising. Never name "${astroContext.sunSign ?? ""}" or "${astroContext.ascendantSign ?? ""}". This is solely a stylistic and thematic nudge):${
          astroContext.toneHint ? `\n- Tone nudge: ${astroContext.toneHint}.` : ""
        }${
          astroContext.focusArea
            ? `\n- Possible life area in play: "${astroContext.focusArea.label}". If — and ONLY if — the reading content genuinely fits, you may quietly orient one observation toward this area. Do not name the area as a "focus" or "house". If it doesn't fit, ignore it.`
            : ""
        }\n`
      : "";

    // Deeper readings get more reflection space
    const reflectionLength =
      cards.length >= 5
        ? "6–8 sentences"
        : cards.length >= 4
          ? "5–7 sentences"
          : "4–6 sentences";

    const userPrompt = `${profileBlock}${intentionLine}They drew ${readingDesc}.

${cardSummary}
${guidanceLine}${momentLine}${readingContextBlock}${priorBlock}${quoteHint}${astroBlock}

${modeInstruction[mode]}

Voice direction for THIS reading (follow these — don't acknowledge them):
- ${voice.open}
- ${voice.rhythm}
- ${voice.lean}
- ${voice.close}

Forbidden recycled phrases (do NOT use any of these, even slightly reworded): "trust the process", "lean into", "hold space", "sit with", "honor your", "let go and", "the answer lies", "deep down you know", "you are exactly where you need to be".

Leave a little room for interpretation. Not everything has to be explained. Allow one small ambiguity if it makes the reading feel more honest.

Respond in JSON with these fields:${multiInstructions}
- "reflection": ${reflectionLength}. Reflect their situation back to them. Follow the arc of the card positions — they tell a story from beginning to end. Name what they may already half-feel but haven't said. Slightly confronting, never harsh.

Variation token: ${entropy} (ignore — only here to keep readings fresh).
Sound written in the moment, not assembled. Return only valid JSON. No markdown, no preamble.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 1.05,
          top_p: 0.95,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Too many requests. Please pause for a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits are exhausted. Add credits in your Lovable workspace to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: {
      theme?: string;
      tension?: string;
      combined?: string;
      reflection?: string;
    } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reflection: content };
    }

    return new Response(
      JSON.stringify({
        theme: parsed.theme ?? "",
        tension: parsed.tension ?? "",
        combined: parsed.combined ?? "",
        reflection: parsed.reflection ?? "",
        // Echo back the focus area (if any) so the client can render a
        // small "Focus: …" chip and persist it with the insight.
        focusArea: astroContext?.focusArea ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("reflect error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
