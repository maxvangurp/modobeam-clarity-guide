import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReflectionCard } from "@/components/ReflectionCard";
import { Button } from "@/components/ui/button";
import { drawCards, type OracleCard } from "@/data/deck";
import { getReadingType, type DrawType } from "@/data/readingTypes";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { getProfile, GUIDANCE_LABELS, INTENT_LABELS, STATE_LABELS } from "@/lib/profile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Draw = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const intention = searchParams.get("q") ?? "";
  const fromOnboarding = searchParams.get("from") === "onboarding";
  const navigate = useNavigate();
  const profile = getProfile();

  const reading = getReadingType(type ?? "");

  const count = reading?.cardCount ?? 1;
  const cards = useMemo<OracleCard[]>(
    () => drawCards(count),
    [type],
  );

  const [revealed, setRevealed] = useState<boolean[]>(
    Array(count).fill(false),
  );
  const [loading, setLoading] = useState(false);

  const allRevealed = revealed.every(Boolean);

  const reveal = (i: number) => {
    setRevealed((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  const revealAll = () => setRevealed(Array(count).fill(true));

  useEffect(() => {
    if (!reading) navigate("/");
  }, [reading, navigate]);

  if (!reading) return null;

  const labels = reading.positionLabels;

  const continueToInsight = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reflect", {
        body: {
          intention,
          drawType: type,
          positionLabels: labels,
          cards: cards.map((c) => ({
            name: c.name,
            keyword: c.keyword,
            category: c.category,
            shortMeaning: c.shortMeaning,
            deeperMeaning: c.deeperMeaning,
          })),
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const session_id = getSessionId();
      const combinedPayload = JSON.stringify({
        theme: (data as any).theme ?? "",
        tension: (data as any).tension ?? "",
        combined: (data as any).combined ?? "",
      });
      const { data: inserted, error: insertErr } = await supabase
        .from("insights")
        .insert({
          session_id,
          intention: intention || null,
          draw_type: type!,
          cards: cards.map((c) => ({ id: c.id, name: c.name })),
          combined_insight: combinedPayload,
          ai_reflection: (data as any).reflection ?? "",
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      navigate(`/insight/${inserted.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Couldn't generate reflection. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Layout: 1 card = centered, 3 = row of 3, 4 = 2×2 grid, 5 = 3+2
  const gridClass =
    count === 1
      ? "flex justify-center"
      : count === 3
        ? "grid grid-cols-3 gap-2 justify-items-center"
        : count === 4
          ? "grid grid-cols-2 gap-3 justify-items-center max-w-[280px] mx-auto"
          : "grid grid-cols-3 gap-2 justify-items-center";

  return (
    <AppShell showBack backTo="/">
      <div className="text-center pt-2 pb-8 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {reading.label}
        </p>
        <h1 className="font-display text-2xl font-light text-foreground">
          {allRevealed ? "Sit with what you see." : "Tap each card when ready."}
        </h1>
        {intention && (
          <p className="mt-3 text-sm text-muted-foreground italic max-w-xs mx-auto">
            "{intention}"
          </p>
        )}
      </div>

      <div className={`${gridClass} animate-fade-up [animation-delay:120ms]`}>
        {cards.map((card, i) => (
          <div key={card.id} className="flex flex-col items-center gap-2">
            <ReflectionCard
              card={card}
              index={i}
              size={count >= 4 ? "sm" : count === 3 ? "sm" : "lg"}
              revealed={revealed[i]}
              onReveal={() => reveal(i)}
            />
            {count > 1 && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center max-w-[90px] leading-tight">
                {labels[i]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 animate-fade-up [animation-delay:300ms]">
        {!allRevealed ? (
          <Button
            variant="ghost"
            onClick={revealAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Reveal all
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={continueToInsight}
            disabled={loading}
            className="rounded-full bg-gradient-button text-primary-foreground px-8 shadow-soft min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reflecting...
              </>
            ) : (
              "See your insight"
            )}
          </Button>
        )}
      </div>
    </AppShell>
  );
};

export default Draw;
