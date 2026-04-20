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

interface Payload {
  intention?: string;
  drawType: string;
  positionLabels?: string[];
  cards: CardInput[];
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
    const { intention, drawType, positionLabels, cards } =
      (await req.json()) as Payload;

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

    // Deeper readings get more reflection space
    const reflectionLength =
      cards.length >= 5
        ? "6–8 sentences"
        : cards.length >= 4
          ? "5–7 sentences"
          : "4–6 sentences";

    const userPrompt = `${intentionLine}They drew ${readingDesc}.

${cardSummary}

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
