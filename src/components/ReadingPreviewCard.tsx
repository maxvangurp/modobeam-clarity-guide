// Modobeam — reading preview card
//
// One reusable surface for both the home Explore carousel and the
// Readings library. Carries a category accent tint, a small icon, the
// label + 1-line subtitle, a depth chip ("3 cards · deeper"), and three
// possible states: ready / locked / coming-soon.

import { Link } from "react-router-dom";
import { Lock, Sparkles, type LucideIcon } from "lucide-react";
import type { CardCategory } from "@/data/deck";
import { getCategoryAccent } from "@/lib/categoryAccent";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";

export type ReadingPreviewState = "ready" | "locked" | "coming-soon";

export type ReadingPreviewSize = "carousel" | "stacked" | "feature" | "compact";

export interface ReadingPreviewProps {
  /** Used for navigation when state === "ready" */
  to?: string;
  label: string;
  subtitle?: string;
  /** Short, one-sentence — appears under the title in stacked mode */
  description?: string;
  cardCount: number;
  icon: LucideIcon;
  category: CardCategory;
  state?: ReadingPreviewState;
  /** When locked: how many more reflections until it appears */
  unlockIn?: number;
  size?: ReadingPreviewSize;
  className?: string;
}

const DEPTH_LABEL: Record<number, string> = {
  1: "quick",
  2: "light",
  3: "deeper",
  4: "deeper",
  5: "deepest",
};

export const ReadingPreviewCard = ({
  to,
  label,
  subtitle,
  description,
  cardCount,
  icon: Icon,
  category,
  state = "ready",
  unlockIn,
  size = "stacked",
  className,
}: ReadingPreviewProps) => {
  const accent = getCategoryAccent(category);
  const depth = DEPTH_LABEL[cardCount] ?? "deeper";

  const isCarousel = size === "carousel";
  const isFeature = size === "feature";
  const isCompact = size === "compact";
  const interactive = state === "ready" && !!to;

  const surfaceBg = isFeature
    ? `linear-gradient(160deg, hsl(var(--card)) 0%, hsl(${accent.bg} / 0.18) 46%, hsl(${accent.hsl} / 0.18) 100%)`
    : isCompact
      ? `linear-gradient(180deg, hsl(var(--background) / 0.86) 0%, hsl(${accent.bg} / 0.14) 100%)`
      : `linear-gradient(180deg, hsl(var(--card)) 0%, hsl(${accent.bg} / 0.22) 52%, hsl(${accent.bg} / 0.42) 100%)`;
  const orbBg = `linear-gradient(135deg, hsl(${accent.bg}) 0%, hsl(${accent.hsl}) 100%)`;
  const orbGlow = `0 6px 18px hsl(${accent.hsl} / 0.16)`;

  const inner = (
    <div
        className={cn(
          "relative h-full overflow-hidden border bg-card transition-smooth",
        interactive
          ? "shadow-soft hover:-translate-y-0.5 hover:shadow-card"
          : "shadow-soft",
          isFeature
            ? "rounded-[1.2rem] px-5 py-5"
            : isCompact
              ? "rounded-[1rem] px-4 py-3.5"
              : isCarousel
                ? "rounded-[0.95rem] px-4.5 py-4.5"
                : "rounded-[0.95rem] px-5 py-5",
        state !== "ready" && "opacity-90",
        className,
      )}
      style={{
        backgroundImage: surfaceBg,
        borderColor: `hsl(${accent.ring} / ${state === "ready" ? 0.26 : 0.14})`,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: `hsl(${accent.ring} / 0.36)` }}
      />
      {/* Top row — orb + depth chip */}
      <div className={cn(
        "flex items-start justify-between gap-3",
        isFeature ? "mb-6" : isCompact ? "mb-3" : isCarousel ? "mb-3.5" : "mb-4.5",
      )}>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border",
            isFeature ? "h-9 w-9" : "h-7 w-7",
          )}
          style={{
            backgroundImage: state === "ready" ? orbBg : undefined,
            backgroundColor: state === "ready" ? undefined : "hsl(var(--secondary) / 0.5)",
            borderColor: state === "ready" ? `hsl(${accent.ring} / 0.18)` : "hsl(var(--border) / 0.7)",
            boxShadow: state === "ready" ? orbGlow : undefined,
          }}
        >
          {state === "locked" ? (
             <Lock className={cn(isFeature ? "h-3.5 w-3.5" : "h-3 w-3", "text-muted-foreground/70")} strokeWidth={1.7} />
          ) : state === "coming-soon" ? (
             <Sparkles className={cn(isFeature ? "h-3.5 w-3.5" : "h-3 w-3", "text-muted-foreground/70")} strokeWidth={1.7} />
          ) : (
             <Icon className={cn(isFeature ? "h-4 w-4" : "h-3.5 w-3.5", "text-white/95")} strokeWidth={1.8} />
          )}
        </span>

        <span
            className={cn(
              "whitespace-nowrap rounded-full border font-semibold uppercase",
              isFeature
                ? "px-3 py-1.5 text-[8px] tracking-[0.2em]"
                : isCompact
                  ? "px-2.5 py-1 text-[7px] tracking-[0.16em]"
                  : "px-2.5 py-1 text-[7.5px] tracking-[0.18em]",
            )}
          style={{
             color: `hsl(${accent.ring} / 0.96)`,
             borderColor: `hsl(${accent.ring} / 0.2)`,
             backgroundColor: `hsl(${accent.bg} / 0.22)`,
          }}
        >
          {cardCount} {cardCount === 1 ? "card" : "cards"} · {depth}
        </span>
      </div>

      {/* Title + subtitle */}
      <div className={cn(
        isFeature ? "min-h-[6.5rem] space-y-2" : isCompact ? "space-y-0.5" : isCarousel ? "min-h-[5rem] space-y-1" : "space-y-1.5",
      )}>
        <p
          className={cn(
            "font-display leading-[1.14] text-foreground",
              isFeature
                ? "max-w-[12ch] text-[1.48rem] font-semibold"
                : isCompact
                  ? "text-[1rem] font-semibold"
                  : isCarousel
                    ? "max-w-[11ch] text-[1.18rem] font-semibold"
                    : "text-[1.08rem] font-semibold",
          )}
        >
          {label}
        </p>
        {subtitle && (
          <p className={cn(
            "text-muted-foreground/94",
            isFeature
              ? "max-w-[24ch] text-[12.5px] leading-[1.62]"
              : isCompact
                ? "max-w-[24ch] text-[11px] leading-[1.45]"
                : "max-w-[19ch] text-[11px] leading-[1.48]",
          )}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Description (stacked only) */}
      {!isCarousel && description && (
        <p className={cn("pt-0.5 text-[12.5px] leading-[1.65] text-muted-foreground/86", layout.sectionHint)}>
          {description}
        </p>
      )}

      {/* State footer */}
      {state === "locked" && (
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/76">
          {unlockIn && unlockIn > 0
            ? `${unlockIn} more reflection${unlockIn === 1 ? "" : "s"}`
            : "Locked"}
        </p>
      )}
      {state === "coming-soon" && (
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/76">
          Coming soon
        </p>
      )}
    </div>
  );

  if (interactive) {
    return (
      <Link
        to={to!}
          className={cn(
             "group block rounded-[1rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
             isCarousel ? "w-[15.25rem] shrink-0" : "w-full",
          )}
        aria-label={`Open ${label}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      className={cn(
         isCarousel ? "w-[15.25rem] shrink-0" : "w-full",
        "cursor-default",
      )}
      aria-disabled
    >
      {inner}
    </div>
  );
};
