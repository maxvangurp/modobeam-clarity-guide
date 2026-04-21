// Modobeam — Life Area card view
// Visually consistent with the existing oracle deck:
//  - soft blue/indigo gradient background
//  - centered minimal symbol (LifeAreaGlyph)
//  - title (large, centered)
//  - short reflection text
//  - footer label "Life Area"
//
// Two display sizes: a compact preview (used in browse grids and small
// surfaces) and a full-bleed reading-style card.

import type { LifeAreaCard as LifeAreaCardType } from "@/data/lifeAreas";
import { LifeAreaGlyph } from "@/components/LifeAreaGlyph";
import { cn } from "@/lib/utils";

interface Props {
  card: LifeAreaCardType;
  size?: "compact" | "full";
  className?: string;
  onClick?: () => void;
}

export const LifeAreaCard = ({
  card,
  size = "full",
  className,
  onClick,
}: Props) => {
  const compact = size === "compact";
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "relative w-full text-left rounded-3xl border border-border/50 shadow-soft overflow-hidden transition-smooth",
        // Soft indigo / dusty-blue gradient — keeps the calm Modobeam feel
        "bg-[linear-gradient(160deg,hsl(40_30%_98%)_0%,hsl(211_45%_92%)_55%,hsl(218_38%_82%)_100%)]",
        onClick && "hover:shadow-card hover:-translate-y-0.5 cursor-pointer",
        className,
      )}
    >
      {/* subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 18%, hsl(211 70% 88% / 0.55) 0%, transparent 60%)",
        }}
      />

      <div
        className={cn(
          "relative flex flex-col items-center text-center",
          compact ? "px-4 pt-5 pb-4" : "px-6 pt-9 pb-7",
        )}
      >
        {/* Glyph */}
        <div
          className={cn(
            "text-[hsl(218_45%_28%)]",
            compact ? "h-20 w-20" : "h-32 w-32",
          )}
        >
          <LifeAreaGlyph motif={card.motif} className="h-full w-full" />
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-display font-light tracking-tight text-foreground mt-3",
            compact ? "text-[18px]" : "text-[28px] leading-tight mt-5",
          )}
        >
          {card.name}
        </h3>

        {/* Theme — small caps */}
        <p
          className={cn(
            "uppercase tracking-[0.22em] text-[hsl(218_30%_38%)]/80 mt-1",
            compact ? "text-[9px]" : "text-[10px]",
          )}
        >
          {card.theme}
        </p>

        {/* Short reflection text */}
        <p
          className={cn(
            "text-foreground/80 leading-relaxed mt-3 max-w-[34ch]",
            compact ? "text-[12px]" : "text-[14px] mt-5",
          )}
        >
          {card.shortMeaning}
        </p>

        {/* Footer label */}
        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 backdrop-blur px-2.5 py-0.5",
            compact ? "text-[9px]" : "text-[10px]",
          )}
        >
          <span className="h-1 w-1 rounded-full bg-[hsl(218_45%_28%)]/70" />
          <span className="uppercase tracking-[0.25em] text-[hsl(218_30%_30%)]/80">
            Life Area
          </span>
        </div>
      </div>
    </Wrapper>
  );
};
