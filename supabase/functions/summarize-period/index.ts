// Modobeam — period summary edge function
// Generates weekly / monthly reflective summaries from past readings.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CardRef {
  id: string;
  name: string;
}

interface ReadingInput {
  draw_type: string;
  cards: CardRef[];
  combined_insight: string | null;
  created_at: string;
}

interface Payload {
  period: "week" | "month";
  readings: ReadingInput[];
}

const SYSTEM_PROMPT = `You are Modobeam's reflective voice. You analyze a person's readings over a period of time and surface the patterns underneath — what they've been sitting with, where the tension lives, what's shifting.

Tone: calm, reflective, slightly intuitive, always grounded. Like a thoughtful therapist reviewing someone's journal entries together. Allow soft metaphor when it sharpens the truth.

Hard rules:
- Never use mystical language ("the universe", "energy", "spirit", "manifest", "destiny").
- Never predict the future.
- Never list the cards mechanically. Interpret the *pattern*.
- Never write something that could apply to anyone. Be specific to what shows up.
- No clichés. No filler. No "trust the process."
- Speak directly as "you".

Your job: Identify what this person has been moving through — the recurring pulls, the unresolved tensions, what's emerging — and reflect it back in a way that creates a moment of recognition.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { period, readings } = (await req.json()) as Payload;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!readings || readings.length === 0) {
      return new Response(
        JSON.stringify({ summary: "", themes: [], corePattern: "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build a concise digest of all readings
    const cardFreq = new Map<string, number>();
    const allThemes: string[] = [];

    const readingDigest = readings.map((r, i) => {
      r.cards.forEach((c) => cardFreq.set(c.name, (cardFreq.get(c.name) ?? 0) + 1));

      let theme = "";
      if (r.combined_insight) {
        try {
          const parsed = JSON.parse(r.combined_insight);
          theme = parsed.theme || "";
          if (theme) allThemes.push(theme);
        } catch {
          // plain text
        }
      }

      const date = new Date(r.created_at).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return `${date}: ${r.cards.map((c) => c.name).join(" + ")}${theme ? ` — "${theme}"` : ""}`;
    }).join("\n");

    const topCards = [...cardFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (×${count})`)
      .join(", ");

    const periodLabel = period === "week" ? "week" : "month";

    const openings = [
      "Open with a quiet observation about the overall pattern.",
      "Open with the central tension this person has been circling.",
      "Open with what seems to be shifting or emerging.",
      "Open by naming the feeling that runs through these readings.",
    ];
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const entropy = Math.random().toString(36).slice(2, 8);

    const userPrompt = `Here are someone's Modobeam readings over the past ${periodLabel} (${readings.length} readings):

${readingDigest}

Most drawn cards: ${topCards}

Voice: ${pick(openings)}

Respond in JSON:
- "corePattern": ONE sentence. The central tension or pattern across these readings. Example: "Letting Go ↔ Attachment" or "Knowing vs waiting to act". Make it specific to what actually showed up, not generic.
- "themes": An array of 2-3 strings. The main themes that kept appearing, as short recognizable labels (e.g. "holding on", "self-doubt", "quiet readiness").
- "summary": 3-4 sentences for a ${periodLabel}. A reflective summary of what this person has been moving through. Detect emotional tension, progress, stagnation, or emerging direction. Sound written, not generated. ${period === "month" ? "Allow slightly more depth." : ""}

Variation token: ${entropy}
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
          temperature: 0.9,
          top_p: 0.95,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: { summary?: string; themes?: string[]; corePattern?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content };
    }

    return new Response(
      JSON.stringify({
        summary: parsed.summary ?? "",
        themes: parsed.themes ?? [],
        corePattern: parsed.corePattern ?? "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("summarize-period error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
