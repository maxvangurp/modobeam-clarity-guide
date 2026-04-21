// Modobeam — "How I'm starting to know you"
// Generates a small observational note from the last batch of reflections.
// 2-3 short observations about *how* the user shows up, not *what* they
// reflect on. Frequency-shaped patterns, not therapy.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Reflection {
  date: string;
  draw_type: string;
  cards: string[];
  theme?: string;
  tension?: string;
}

interface Payload {
  reflections: Reflection[];
  firstName?: string | null;
  cadenceHint?: string; // e.g., "Sunday evenings", "weekday mornings"
}

const SYSTEM_PROMPT = `You are Modobeam — quietly observing how someone has been showing up across their reflections.

You are NOT summarizing what they reflect on. You are noticing HOW they show up:
- Sentence rhythm if visible (short, long, fragmented)
- Recurring stances (questioning, naming, returning, retreating)
- Time-of-day patterns if mentioned
- The shape of their inner attention — what they keep circling

Voice:
- Short, observational, generous.
- Speaks AS IF noticing them lightly — never analyzing.
- Always 2-3 short sentences. Never more.
- Each sentence is a separate small observation, not a thesis.
- No clinical or therapeutic language.
- Never use "you tend to" — too cold. Use "you" naturally, like a friend who's been paying attention.

Hard rules:
- 2-3 sentences. Maximum 60 words.
- No advice, no labels, no diagnoses.
- Never reference specific cards, dates, or themes literally.
- No "perhaps", "maybe", "it seems".
- Begin with one of: "You", "Often,", "Lately,", "There's", "Something" — vary it.
- Return only the note text. No JSON, no preamble.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reflections, firstName, cadenceHint } = (await req.json()) as Payload;

    if (!reflections || reflections.length < 5) {
      return new Response(JSON.stringify({ note: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lines = reflections
      .slice(0, 20)
      .map(
        (r, i) =>
          `${i + 1}. ${r.date} (${r.draw_type}) — cards: ${r.cards.join(", ")}${
            r.theme ? ` · theme: "${r.theme}"` : ""
          }${r.tension ? ` · tension: "${r.tension}"` : ""}`,
      )
      .join("\n");

    const userPrompt = `${firstName ? `Their name is ${firstName}.\n` : ""}${
      cadenceHint ? `Cadence pattern noticed: ${cadenceHint}.\n` : ""
    }
Their last ${reflections.length} reflections:
${lines}

Write 2-3 short observations about HOW this person shows up. Not what they reflect on — how. Each observation a separate sentence. Generous, light, never clinical.`;

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
          JSON.stringify({ error: "Too many requests." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits are exhausted." }),
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
    const note = (data.choices?.[0]?.message?.content ?? "").trim();

    return new Response(JSON.stringify({ note }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("know-you error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
