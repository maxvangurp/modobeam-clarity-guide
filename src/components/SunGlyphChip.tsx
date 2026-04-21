// Modobeam — quiet zodiac sun-glyph chip.
// Renders a small, optional badge with the user's sun-sign glyph and name
// (e.g. "♋ Cancer"). Returns null when no birthday is set, so the chip
// only appears when the user has opted in.
//
// Visually tuned to match the soft Modobeam look: indigo gradient pill,
// faint glow ring around the glyph, and a tiny separator dot before the
// sign name. Calm, never loud.

import { useMemo } from "react";
import { getProfile, isAstroLensEnabled } from "@/lib/profile";
import { getCachedChart, SIGN_GLYPHS } from "@/lib/astrology";
import { cn } from "@/lib/utils";

interface Props {
  /** When true (default), shows sign name. When false, glyph only. */
  showName?: boolean;
  className?: string;
}

export const SunGlyphChip = ({ showName = true, className }: Props) => {
  const profile = getProfile();
  const enabled = isAstroLensEnabled(profile);
  const chart = useMemo(() => {
    if (!enabled || !profile?.birthday) return null;
    return getCachedChart({
      date: profile.birthday,
      time: profile.birthTime ?? null,
      lat: profile.birthLat ?? null,
      lon: profile.birthLon ?? null,
      tzOffsetMin: profile.birthTzOffsetMin ?? null,
    });
  }, [
    enabled,
    profile?.birthday,
    profile?.birthTime,
    profile?.birthLat,
    profile?.birthLon,
    profile?.birthTzOffsetMin,
  ]);

  if (!chart) return null;
  const sign = chart.sun.sign;
  const glyph = SIGN_GLYPHS[sign];
  const ascHint = chart.ascendant
    ? `Sun in ${sign}, rising in ${chart.ascendant.sign}`
    : `Sun in ${sign}`;

  return (
    <span
      title={ascHint}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5 shrink-0",
        "border border-[hsl(218_38%_70%)]/30",
        "bg-[linear-gradient(135deg,hsl(40_30%_98%)_0%,hsl(211_42%_94%)_55%,hsl(218_36%_88%)_100%)]",
        "shadow-[0_1px_0_hsl(0_0%_100%/0.6)_inset,0_4px_14px_-8px_hsl(218_45%_28%/0.3)]",
        "backdrop-blur transition-smooth",
        className,
      )}
    >
      {/* Glow ring around the glyph */}
      <span
        aria-hidden
        className="relative h-5 w-5 rounded-full flex items-center justify-center bg-background/60 border border-[hsl(218_38%_70%)]/40 shadow-[0_0_10px_hsl(218_60%_70%/0.35)]"
      >
        <span className="text-[12px] leading-none text-[hsl(218_45%_28%)]">
          {glyph}
        </span>
      </span>
      {showName && (
        <span className="text-[11px] tracking-[0.06em] text-[hsl(218_35%_30%)]/90 font-medium">
          {sign}
        </span>
      )}
    </span>
  );
};
