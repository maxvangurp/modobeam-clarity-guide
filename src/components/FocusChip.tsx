// Modobeam — Focus chip
// A small, calm pill that names the astrological focus area derived for
// a reading (e.g. "Focus · Voice"). Visually matches the SunGlyphChip:
// soft indigo gradient, gentle glow, low-key typography. Renders null
// when the astro lens is off so it never leaks through.

import { isAstroLensEnabled } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { Sparkle } from "lucide-react";

interface Props {
  label: string;
  /** Optional moment tint to inherit from the parent reading. */
  tintRing?: string;
  className?: string;
}

export const FocusChip = ({ label, tintRing, className }: Props) => {
  if (!isAstroLensEnabled()) return null;

  // When a moment tint is active, blend it gently into the chip border
  // and glow without losing the indigo base.
  const ringColor = tintRing ?? "hsl(218 38% 70% / 0.45)";

  return (
    <span
      title="A soft life-area lens — never a prediction."
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5 shrink-0",
        "border bg-[linear-gradient(135deg,hsl(40_30%_98%)_0%,hsl(211_42%_94%)_55%,hsl(218_36%_88%)_100%)]",
        "shadow-[0_1px_0_hsl(0_0%_100%/0.6)_inset,0_4px_14px_-8px_hsl(218_45%_28%/0.3)]",
        "backdrop-blur transition-smooth",
        className,
      )}
      style={{ borderColor: ringColor }}
    >
      <span
        aria-hidden
        className="relative h-5 w-5 rounded-full flex items-center justify-center bg-background/60 border border-[hsl(218_38%_70%)]/40 shadow-[0_0_10px_hsl(218_60%_70%/0.35)]"
      >
        <Sparkle
          className="h-2.5 w-2.5 text-[hsl(218_45%_28%)]"
          strokeWidth={1.8}
        />
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(218_35%_30%)]/90 font-medium">
        Focus · {label}
      </span>
    </span>
  );
};
