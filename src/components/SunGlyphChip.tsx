// Modobeam — quiet zodiac sun-glyph chip.
// Renders a small, optional badge with the user's sun-sign glyph and name
// (e.g. "♋ Cancer"). Returns null when no birthday is set, so the chip
// only appears when the user has opted in.

import { useMemo } from "react";
import { getProfile, isAstroLensEnabled } from "@/lib/profile";
import { getCachedChart, SIGN_GLYPHS } from "@/lib/astrology";

interface Props {
  /** When true (default), shows sign name. When false, glyph only. */
  showName?: boolean;
  className?: string;
}

export const SunGlyphChip = ({ showName = true, className = "" }: Props) => {
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
      className={`inline-flex items-center gap-1.5 rounded-full bg-card/50 backdrop-blur border border-border/40 px-2 py-0.5 text-[11px] text-muted-foreground/90 shrink-0 ${className}`}
    >
      <span aria-hidden className="text-foreground/80 leading-none">
        {glyph}
      </span>
      {showName && (
        <span className="tracking-wide">{sign}</span>
      )}
    </span>
  );
};
