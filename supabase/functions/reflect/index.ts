// Modobeam — AI reflection edge function
// Calls Lovable AI Gateway to produce grounded, coach-like reflections.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  drawType: "daily" | "three";
  cards: CardInput[];
}

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
- Reading the *combination* as one lived situation, not three separate cards.
- Naming the emotional tension underneath — what's pulling in two directions.
- Reflecting back what the user might already half-know but hasn't let themselves say.
- Leaving them with a moment of recognition, not a verdict.`;


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intention, drawType, cards } = (await req.json()) as Payload;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isMulti = cards.length > 1;
    const positionLabels = drawType === "three"
      ? ["Past influence", "Present focus", "Emerging direction"]
      : ["Today"];

    const cardSummary = cards
      .map(
        (c, i) =>
          `${positionLabels[i] ?? `Card ${i + 1}`} — ${c.name} (${c.category}, "${c.keyword}")\n  Short: ${c.shortMeaning}\n  Underlying pattern: ${c.deeperMeaning}`,
      )
      .join("\n\n");

    const intentionLine = intention?.trim()
      ? `What they shared:\n"${intention.trim()}"\n\n`
      : `They didn't share a specific intention. Speak to common human experience that fits this combination.\n\n`;

    const multiInstructions = isMulti
      ? `
- "theme": ONE sentence. Name what this moment in their life is actually about. Specific, recognizable, never a definition. Example: "You're trying to make a decision your body has already made."
- "tension": ONE or TWO sentences. The real friction between these cards as a lived feeling — not a definition. Example: "You're holding on to something you also know you need to release. Both feelings are true, and that's why it hurts."
- "combined": 2–3 sentences. Read the *combination* as one situation. Don't restate the cards.`
      : `
- "theme": ONE sentence. Name what this card is pointing to in their actual life right now. Specific, not a definition.
- "combined": 2–3 sentences. A grounded interpretation of how this card meets their current moment.`;

    // Rotate opening style + voice seed so readings don't sound the same
    const openingStyles = [
      "Open with a quiet observation about what's happening underneath.",
      "Open with the tension itself, named directly in one line.",
      "Open with a soft, grounded metaphor or small image.",
      "Open with a short question that lands the theme.",
      "Open with a single declarative sentence — flat, honest, no warm-up.",
      "Open by naming a feeling the user might be sitting with but not saying.",
    ];
    const voiceSeed = openingStyles[Math.floor(Math.random() * openingStyles.length)];

    const userPrompt = `${intentionLine}They drew ${drawType === "three" ? "a 3-card insight (past influence → present focus → emerging direction)" : "a single daily card"}.

${cardSummary}

Voice direction for THIS reading: ${voiceSeed}
Vary sentence length. Don't follow a template. Let it breathe.

Respond in JSON with these fields:${multiInstructions}
- "reflection": 4–6 sentences. Reflect their situation back to them. Name what they may already half-feel but haven't said. Slightly confronting, never harsh. End with ONE honest open question (not rhetorical).

Make this sound written, not generated. For THIS combination, not a horoscope. Return only valid JSON. No markdown, no preamble.`;


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
          temperature: 0.95,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Too many requests. Please pause for a moment and try again.",
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
