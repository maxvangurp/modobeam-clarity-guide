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

const SYSTEM_PROMPT = `You are Modobeam, a thoughtful reflection guide. Think like a perceptive therapist or coach — emotionally accurate, grounded, and quietly direct. You help people see what's actually happening in their lives.

Tone: modern, warm, intelligent, slightly confronting but always supportive. Like a friend who tells you the truth kindly. Never mystical, never a fortune teller, never spiritual cliché.

Hard rules:
- Never predict the future or claim to know what will happen.
- Never say "the universe", "energy is shifting", "the cards reveal", "spirit guides", "destiny", "manifest", or any mystical phrasing.
- Never tell the user what they "must" do — offer perspectives.
- Never repeat the card meanings literally. Interpret the *combination* as a real-life situation.
- Never write generic summaries that could apply to anyone.
- Use plain modern language. Short sentences. No filler. No hedging like "perhaps" or "maybe".
- Speak directly to the user as "you".

When multiple cards are drawn, your most important job is to:
1. Identify the *tension* between them (e.g. "you want connection but you're protecting yourself from it", or "you know it's time to act, but you're still trying to be certain first").
2. Name a single core theme — what this moment in their life is actually about.
3. Synthesize the cards into one coherent picture, not three separate readings.

Treat the cards as a mirror of the user's current pattern, not as omens.`;

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
- "theme": ONE sentence. Name what this moment in their life is actually about. Specific, not generic. Example: "You're trying to make a decision your body has already made."
- "tension": ONE or TWO sentences. Name the real friction between these cards as a lived situation — not a definition. Example: "You're holding on to something you also know you need to release. Both feelings are true, and that's why it hurts."
- "combined": 2–3 sentences. Connect the cards into one coherent reading of their current pattern. Do NOT restate each card. Interpret the *combination*.`
      : `
- "theme": ONE sentence. Name what this card is pointing to in their actual life right now. Specific, not a definition.
- "combined": 2–3 sentences. A grounded interpretation of how this card meets their current moment.`;

    const userPrompt = `${intentionLine}They drew ${drawType === "three" ? "a 3-card insight (past influence → present focus → emerging direction)" : "a single daily card"}.

${cardSummary}

Respond in JSON with these fields:${multiInstructions}
- "reflection": 4–6 sentences. A personal, grounded reflection that lands the theme in their life. Be slightly confronting but supportive — name the thing they may be avoiding. End with ONE open question that invites honest self-inquiry (no rhetorical questions).

Make it feel like it was written for THIS person and THIS combination — not a horoscope. Return only valid JSON. No markdown, no preamble.`;


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

    let parsed: { combined?: string; reflection?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reflection: content };
    }

    return new Response(
      JSON.stringify({
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
