import { useEffect, useRef, useState } from "react";
import type { OracleCard } from "@/data/deck";
import { getCardArt } from "@/data/cardArt";
import { CardSigil } from "@/components/CardSigil";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface Props {
  card: OracleCard;
  index?: number;
  revealed?: boolean;
  onReveal?: () => void;
  onHold?: (active: boolean) => void;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-28 h-44 text-xs",
  md: "w-44 h-72",
  lg: "w-56 h-[22rem]",
};

const HOLD_MS = 380;
const REVEAL_PAUSE_MS = 110;
const REVEAL_TURN_MS = 1480;

type RevealStage = "idle" | "primed" | "turning" | "settled";

export const ReflectionCard = ({
  card,
  index = 0,
  revealed: controlled,
  onReveal,
  onHold,
  size = "md",
}: Props) => {
  const [internal, setInternal] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [holding, setHolding] = useState(false);
  const [revealStage, setRevealStage] = useState<RevealStage>(
    controlled ? "settled" : "idle",
  );
  const holdTimer = useRef<number | null>(null);
  const revealTimers = useRef<number[]>([]);
  const revealed = controlled ?? internal;
  const art = getCardArt(card.id);
  const isAnimatingReveal = revealStage === "primed" || revealStage === "turning";
  const showRevealAtmosphere = revealed || isAnimatingReveal;

  const handleClick = () => {
    if (holding) return; // a hold just ended; swallow the click
    if (revealed || isAnimatingReveal) return;

    haptic("select");
    setRevealStage("primed");

    revealTimers.current.push(
      window.setTimeout(() => {
        haptic("flip");
        setInternal(true);
        setRevealStage("turning");
        onReveal?.();
      }, REVEAL_PAUSE_MS),
    );

    revealTimers.current.push(
      window.setTimeout(() => {
        setRevealStage("settled");
      }, REVEAL_PAUSE_MS + REVEAL_TURN_MS),
    );
  };

  const startHold = () => {
    if (!revealed) {
      setPressing(true);
      return;
    }
    holdTimer.current = window.setTimeout(() => {
      setHolding(true);
      haptic("warm");
      onHold?.(true);
    }, HOLD_MS);
  };
  const endHold = () => {
    setPressing(false);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (holding) {
      setHolding(false);
      onHold?.(false);
    }
  };

  useEffect(() => {
    if (controlled === true) {
      setRevealStage("settled");
      return;
    }

    if (controlled === false) {
      setRevealStage("idle");
      setInternal(false);
    }
  }, [controlled]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      revealTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      onContextMenu={(e) => revealed && e.preventDefault()}
      disabled={false}
      className={cn(
        "relative perspective-1200 group outline-none transition-transform duration-500",
        sizes[size],
        !revealed && !isAnimatingReveal && "cursor-pointer",
        revealed && "cursor-default",
        (holding || isAnimatingReveal) && "z-30",
        holding && "animate-hold-rise",
      )}
      style={{ animationDelay: `${index * 120}ms` }}
      aria-label={revealed ? `${card.name} card — hold to focus` : "Tap to reveal"}
      disabled={isAnimatingReveal}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-10 rounded-[2.4rem] opacity-0 transition-opacity duration-500",
          "bg-[radial-gradient(ellipse_at_center,hsl(var(--beam)/0.18),transparent_72%)]",
          showRevealAtmosphere && "animate-card-aura opacity-100",
        )}
      />

      {/* Subtle floor glow that intensifies during flip */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-6 rounded-[2rem] blur-2xl transition-all duration-700",
          "bg-[radial-gradient(ellipse_at_center,hsl(var(--beam)/0.25),transparent_70%)]",
          revealed ? "opacity-60" : "opacity-0 group-hover:opacity-30",
          showRevealAtmosphere && "animate-card-glow scale-[1.04]",
          holding && "opacity-90",
        )}
      />

      {/* Outer lift wrapper — handles press/hover translate so the inner 3D transform stays clean */}
      <div
        className={cn(
          "relative h-full w-full transition-transform [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          !revealed && pressing && "scale-[0.97]",
          revealStage === "primed" && "scale-[0.975] -translate-y-[1px]",
          revealStage === "turning" && "-translate-y-1.5 scale-[1.015]",
          !revealed && !pressing && "group-hover:-translate-y-1",
          revealStage === "settled" && "animate-card-settle",
          showRevealAtmosphere ? "duration-[1600ms]" : "duration-500",
        )}
        style={{ perspective: "1200px" }}
      >
        {/* Inner flip wrapper — only handles rotateY, smoothly animated */}
        <div
          className={cn(
            "relative h-full w-full preserve-3d",
            "transition-transform [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            revealed && "rotate-y-180",
          )}
          style={{ transitionDuration: `${REVEAL_TURN_MS}ms` }}
        >
        {/* Back */}
        <div className={cn(
          "absolute inset-0 backface-hidden rounded-[1.5rem] card-back-pattern overflow-hidden transition-shadow duration-700",
          showRevealAtmosphere ? "shadow-card-turn" : "shadow-card",
        )}>
          <div className="absolute inset-0 bg-gradient-beam opacity-60 animate-beam" />
          <div className="absolute inset-3 rounded-[1.25rem] border border-white/10" />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(115deg,transparent_0%,hsl(var(--beam)/0.18)_48%,transparent_100%)] opacity-0",
              isAnimatingReveal && "animate-card-sheen opacity-100",
            )}
          />
          {/* Soft sweep highlight invites the tap */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(115deg,transparent_30%,hsl(0_0%_100%/0.08)_50%,transparent_70%)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-beam/60 blur-xl absolute inset-0" />
              <div className={cn(
                "relative h-10 w-10 rounded-full bg-gradient-to-br from-beam-soft to-beam shadow-glow",
                !revealed && "animate-float-soft",
              )} />
            </div>
          </div>
          <div className="absolute bottom-4 inset-x-0 text-center">
            <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase font-display">
              Modobeam
            </span>
          </div>
        </div>

        {/* Front */}
        <div className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 rounded-[1.5rem] bg-gradient-card overflow-hidden border border-border/60 transition-shadow duration-700",
          showRevealAtmosphere ? "shadow-card-turn" : "shadow-card",
        )}>
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0",
              showRevealAtmosphere && "animate-soft-glow",
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_50%_42%,hsl(var(--beam)/0.26),transparent_58%)]",
              showRevealAtmosphere && "animate-color-bloom",
            )}
          />
          {art ? (
            <img
              src={art}
              alt={`${card.name} card`}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] ease-out",
                revealStage === "turning" && "scale-[1.02]",
              )}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-beam opacity-40" />
              {/* Generative sigil — gives every card its own quiet motif */}
              <div className="absolute inset-0 flex items-center justify-center text-foreground/45 pointer-events-none">
                <CardSigil card={card} className="h-[78%] w-[78%]" />
              </div>
              <div className="absolute inset-3 rounded-[1.25rem] border border-foreground/5" />
              <div className="relative h-full flex flex-col items-center justify-between p-5 text-center">
                <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
                  {card.category}
                </span>

                <div className="flex flex-col items-center gap-2">
                  <h3 className="font-display text-2xl font-medium text-foreground">
                    {card.name}
                  </h3>
                  <p className="text-sm text-muted-foreground italic">
                    {card.keyword}
                  </p>
                </div>

                <div className="h-px w-12 bg-foreground/10" />
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </button>
  );
};
