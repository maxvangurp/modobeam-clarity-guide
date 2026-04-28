// Modobeam — Quick check-in
// A lightweight, low-friction surface that pulls a single Micro card
// for a daily inner-state read. No AI call, no save — just a quiet
// mirror you can tap once and walk away from. "Draw again" reshuffles
// from the Micro deck so it stays disposable and frequent-use friendly.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { CardSigil } from "@/components/CardSigil";
import { drawMicroCards, type OracleCard } from "@/data/deck";
import { getCategoryAccent } from "@/lib/categoryAccent";
import { haptic } from "@/lib/haptics";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

const CheckIn = () => {
  const [card, setCard] = useState<OracleCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    setCard(drawMicroCards(1)[0] ?? null);
    setRevealed(false);
  }, [shuffleKey]);

  const accent = useMemo(
    () => (card ? getCategoryAccent(card.category) : null),
    [card],
  );

  const reveal = useCallback(() => {
    haptic("flip");
    setRevealed(true);
  }, []);

  const drawAgain = useCallback(() => {
    haptic("select");
    setShuffleKey((k) => k + 1);
  }, []);

  return (
    <AppShell showBack backTo="/" screenMood="draw">
      <section className={cn(layout.pageSection, "pt-5 pb-2")}>
        <div className="space-y-2">
          <p className={layout.eyebrow}>Quick check-in</p>
          <h1 className={cn(layout.title, "max-w-[12ch]")}>
            One word for{" "}
            <span className="font-medium italic text-foreground/84">
              right now
            </span>
            .
          </h1>
          <p className="max-w-[30ch] text-[13px] leading-[1.62] text-foreground/74">
            A single micro-card for a fast, honest read on your inner state.
            No saving. No analysis. Just a mirror.
          </p>
        </div>
      </section>

      {card && accent && (
        <section className={cn(layout.pageSection, "pt-6 pb-10")}>
          <div className="mx-auto flex max-w-[22rem] flex-col items-center gap-6">
            <button
              type="button"
              onClick={!revealed ? reveal : undefined}
              aria-label={revealed ? card.name : "Reveal card"}
              className={cn(
                "group relative aspect-[3/4.4] w-full max-w-[15rem] overflow-hidden rounded-[1.6rem] border border-border/72 bg-card/95 shadow-card transition-smooth",
                !revealed &&
                  "cursor-pointer hover:border-border hover:shadow-soft",
              )}
              style={{
                boxShadow: revealed
                  ? `0 16px 48px -28px hsl(${accent.hsl} / 0.55)`
                  : undefined,
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ color: `hsl(${accent.hsl})` }}
              >
                <CardSigil card={card} className="h-full w-full" />
              </span>

              {revealed ? (
                <div className="relative flex h-full flex-col justify-between p-5 text-left animate-fade-up">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                    style={{ color: `hsl(${accent.ring})` }}
                  >
                    {card.category}
                  </p>
                  <div className="space-y-2">
                    <h2 className="font-display text-[2rem] leading-[0.98] text-foreground">
                      {card.name}
                    </h2>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground/86">
                      {card.keyword}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative flex h-full flex-col items-center justify-center gap-2 p-5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `hsl(${accent.hsl})` }}
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/82">
                    Tap to reveal
                  </p>
                </div>
              )}
            </button>

            {revealed && (
              <div className="w-full space-y-5 animate-fade-up">
                <div
                  className="rounded-[1.2rem] border border-border/68 bg-card/92 px-4 py-4 shadow-soft"
                  style={{ borderColor: `hsl(${accent.ring} / 0.32)` }}
                >
                  <p className="text-[14px] leading-[1.6] text-foreground/92">
                    {card.shortMeaning}
                  </p>
                </div>

                {card.prompts[0] && (
                  <div className="space-y-2">
                    <p className={layout.sectionLabel}>Sit with</p>
                    <p className="text-[14px] leading-[1.62] text-foreground/86 italic">
                      "{card.prompts[0]}"
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={drawAgain}
                    className="rounded-full"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.8} />
                    Draw again
                  </Button>
                  <Link
                    to="/"
                    className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/82 transition-smooth hover:text-foreground"
                  >
                    Done
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </AppShell>
  );
};

export default CheckIn;
