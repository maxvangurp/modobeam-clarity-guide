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
  const holdTimer = useRef<number | null>(null);
  const revealed = controlled ?? internal;
  const art = getCardArt(card.id);

  const handleClick = () => {
    if (holding) return; // a hold just ended; swallow the click
    if (revealed) return;
    haptic("flip");
    setInternal(true);
    onReveal?.();
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
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
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
        !revealed && "cursor-pointer",
        revealed && "cursor-default",
        holding && "z-30 animate-hold-rise",
      )}
      style={{ animationDelay: `${index * 120}ms` }}
      aria-label={revealed ? `${card.name} card — hold to focus` : "Tap to reveal"}
    >
      {/* Subtle floor glow that intensifies during flip */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-6 rounded-[2rem] blur-2xl transition-opacity duration-700",
          "bg-[radial-gradient(ellipse_at_center,hsl(var(--beam)/0.25),transparent_70%)]",
          revealed ? "opacity-60" : "opacity-0 group-hover:opacity-30",
          revealed && "animate-card-glow",
          holding && "opacity-90",
        )}
      />

      {/* Outer lift wrapper — handles press/hover translate so the inner 3D transform stays clean */}
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          !revealed && pressing && "scale-[0.97]",
          !revealed && !pressing && "group-hover:-translate-y-1",
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
          style={{ transitionDuration: "1100ms" }}
        >
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rounded-[1.5rem] card-back-pattern shadow-card overflow-hidden">
          <div className="absolute inset-0 bg-gradient-beam opacity-60 animate-beam" />
          <div className="absolute inset-3 rounded-[1.25rem] border border-white/10" />
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
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[1.5rem] bg-gradient-card shadow-card overflow-hidden border border-border/60">
          {art ? (
            <img
              src={art}
              alt={`${card.name} card`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
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
