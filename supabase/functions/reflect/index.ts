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

const SYSTEM_PROMPT = `You are Modobeam, a calm and thoughtful reflection guide. You help people understand themselves with clarity.

Tone: grounded, modern, intelligent, warm, direct. You sound like a wise coach or a thoughtful friend — never mystical, never a fortune teller, never spiritual cliché.

Hard rules:
- Never predict the future or claim to know what will happen.
- Never say "the universe", "energy is shifting", "the cards reveal", "spirit guides", "destiny", or any mystical phrasing.
- Never tell the user what they "must" do. Offer perspectives.
- Use plain, modern language. Short sentences. No filler.
- Speak directly to the user as "you".
- Treat the cards as prompts for self-reflection, not as omens.

Your job: Synthesize the cards drawn (and the user's intention if given) into a brief, personal reflection that helps them see something true about their current situation.`;

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

    const cardSummary = cards
      .map(
        (c, i) =>
          `Card ${i + 1}: ${c.name} (${c.keyword}, ${c.category})\nMeaning: ${c.shortMeaning}\nGuidance for reflection: ${c.deeperMeaning}`,
      )
      .join("\n\n");

    const intentionLine = intention?.trim()
      ? `The user shared what's on their mind:\n"${intention.trim()}"\n\n`
      : `The user did not share a specific intention.\n\n`;

    const userPrompt = `${intentionLine}They drew ${drawType === "daily" ? "a daily clarity card" : "a 3-card insight (past influence → present focus → emerging direction)"}.

${cardSummary}

Respond in JSON with two fields:
- "combined": 2–3 sentences. A clear synthesis of what these cards together suggest about the user's current situation. Speak to the user directly.
- "reflection": 4–6 sentences. A grounded, personal reflection that connects the cards to the user's intention (or to common human experience if no intention was given). End with a single open question that invites self-inquiry.

Return only valid JSON. No markdown, no preamble.`;

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
