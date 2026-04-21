import { useState } from "react";
import type { OracleCard } from "@/data/deck";
import { getCardArt } from "@/data/cardArt";
import { cn } from "@/lib/utils";

interface Props {
  card: OracleCard;
  index?: number;
  revealed?: boolean;
  onReveal?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-28 h-44 text-xs",
  md: "w-44 h-72",
  lg: "w-56 h-[22rem]",
};

export const ReflectionCard = ({
  card,
  index = 0,
  revealed: controlled,
  onReveal,
  size = "md",
}: Props) => {
  const [internal, setInternal] = useState(false);
  const [pressing, setPressing] = useState(false);
  const revealed = controlled ?? internal;
  const art = getCardArt(card.id);

  const handleClick = () => {
    if (revealed) return;
    setInternal(true);
    onReveal?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={() => !revealed && setPressing(true)}
      onPointerUp={() => setPressing(false)}
      onPointerLeave={() => setPressing(false)}
      disabled={revealed}
      className={cn(
        "relative perspective-1200 group outline-none",
        sizes[size],
        !revealed && "cursor-pointer",
      )}
      style={{ animationDelay: `${index * 120}ms` }}
      aria-label={revealed ? `${card.name} card` : "Tap to reveal"}
    >
      {/* Subtle floor glow that intensifies during flip */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-6 rounded-[2rem] blur-2xl transition-opacity duration-700",
          "bg-[radial-gradient(ellipse_at_center,hsl(var(--beam)/0.25),transparent_70%)]",
          revealed ? "opacity-60" : "opacity-0 group-hover:opacity-30",
          revealed && "animate-card-glow",
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
            "transition-transform duration-[1100ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            revealed && "rotate-y-180",
          )}
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
              <div className="absolute inset-3 rounded-[1.25rem] border border-foreground/5" />
              <div className="relative h-full flex flex-col items-center justify-between p-5 text-center">
                <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
                  {card.category}
                </span>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-beam-soft to-beam/80 shadow-glow mb-2 animate-float-soft" />
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
    </button>
  );
};
