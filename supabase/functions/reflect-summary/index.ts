// Modobeam — short personal summary of a user's journal reflection.
// Takes the cards + AI reflection context + the user's journal entry,
// and returns a 1–2 sentence mirror of what they wrote.
//
// This is intentionally short and observational. It is NOT advice.
// The voice should feel like a quiet friend reading what you wrote
// and gently naming what's underneath.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Payload {
  journal: string;
  cards?: { name: string; keyword: string }[];
  theme?: string;
  tension?: string;
  reflection?: string;
  moment?: string | null;
}

const SYSTEM_PROMPT = `You are Modobeam — a quiet, thoughtful voice that mirrors what someone just wrote in their journal.

Your job:
- Read what the user wrote.
- Reflect back, in 1–2 sentences, what seems to be underneath it.
- Name what they may already half-know but haven't said clearly.

Voice:
- Calm, human, warm but not soft.
- Specific to *what they wrote* — never generic.
- Slightly observational, like a friend reading over their shoulder.

Hard rules:
- Never give advice. Never say "you should" or "try to".
- Never use mystical or spiritual language.
- Never repeat their words back at them verbatim.
- Never say "it sounds like" or "it seems like" — be more direct than that.
- 1–2 sentences. Maximum ~40 words. No preamble.
- Do not end with a question.
- If they wrote almost nothing, return one short, grounded line that meets them where they are without forcing meaning.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { journal, cards, theme, tension, reflection, moment } =
      (await req.json()) as Payload;

    if (!journal || !journal.trim()) {
      return new Response(JSON.stringify({ summary: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const cardLine = cards?.length
      ? `Cards in the reading: ${cards
          .map((c) => `${c.name} (${c.keyword})`)
          .join(", ")}.`
      : "";

    const contextBlock = [
      cardLine,
      theme ? `Theme noticed: ${theme}` : "",
      tension ? `Underlying tension: ${tension}` : "",
      reflection ? `Earlier reflection given to them: ${reflection}` : "",
      moment ? `What they said they needed in this moment: ${moment}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const userPrompt = `Context (do not quote back):
${contextBlock}

What they just journaled:
"""
${journal.trim()}
"""

Mirror what's underneath in 1–2 sentences. Be specific to what they wrote. Don't summarize the reading — summarize *them*.`;

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
          top_p: 0.95,
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
            error: "AI credits are exhausted. Add credits to continue.",
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
    const summary = (data.choices?.[0]?.message?.content ?? "").trim();

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reflect-summary error:", e);
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
