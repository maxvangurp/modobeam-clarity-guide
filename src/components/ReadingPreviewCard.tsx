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

export type ReadingPreviewSize = "carousel" | "stacked";

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
  const interactive = state === "ready" && !!to;

  // Soft accent surface — calmer than the saturated mid-tone, premium feel.
  const surfaceBg = `linear-gradient(160deg, hsl(${accent.bg} / 0.6) 0%, hsl(var(--card) / 0.85) 65%)`;
  const orbBg = `linear-gradient(135deg, hsl(${accent.bg}) 0%, hsl(${accent.hsl}) 100%)`;
  const orbGlow = `0 0 18px hsl(${accent.hsl} / 0.28)`;

  const inner = (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-[1.7rem] border backdrop-blur-xl transition-smooth",
        interactive
          ? "shadow-soft hover:-translate-y-0.5 hover:shadow-card"
          : "shadow-soft",
        isCarousel ? "px-5 py-5.5" : "px-5 py-5.5",
        state !== "ready" && "opacity-90",
        className,
      )}
      style={{
        backgroundImage: surfaceBg,
        borderColor: `hsl(${accent.ring} / ${state === "ready" ? 0.22 : 0.12})`,
      }}
    >
      {/* Top row — orb + depth chip */}
      <div className={cn("flex items-start justify-between gap-3", isCarousel ? "mb-4.5" : "mb-4.5")}>
        <span
          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundImage: state === "ready" ? orbBg : undefined,
            backgroundColor: state === "ready" ? undefined : "hsl(var(--secondary) / 0.5)",
            boxShadow: state === "ready" ? orbGlow : undefined,
          }}
        >
          {state === "locked" ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.7} />
          ) : state === "coming-soon" ? (
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.7} />
          ) : (
            <Icon className="h-4 w-4 text-white/95" strokeWidth={1.8} />
          )}
        </span>

        <span
          className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em]"
          style={{
            color: `hsl(${accent.ring})`,
            borderColor: `hsl(${accent.ring} / 0.3)`,
            backgroundColor: `hsl(${accent.bg} / 0.4)`,
          }}
        >
          {cardCount} {cardCount === 1 ? "card" : "cards"} · {depth}
        </span>
      </div>

      {/* Title + subtitle */}
      <div className={cn(isCarousel ? "min-h-[4.4rem] space-y-1.5" : "space-y-2")}>
        <p
          className={cn(
            "font-display leading-[1.14] text-foreground",
            isCarousel ? "text-[1.75rem] font-semibold" : "text-[1rem] font-semibold",
          )}
        >
          {label}
        </p>
        {subtitle && (
          <p className="max-w-[18ch] text-[13px] leading-[1.45] text-muted-foreground/88">
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
            "group block rounded-[1.7rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCarousel ? "w-[17rem] shrink-0" : "w-full",
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
        isCarousel ? "w-[17rem] shrink-0" : "w-full",
        "cursor-default",
      )}
      aria-disabled
    >
      {inner}
    </div>
  );
};
