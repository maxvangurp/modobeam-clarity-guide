// Modobeam — Fancy placeholder card front for cards without bespoke artwork.
// Builds a layered composition: category-tinted gradient, doubled generative
// sigil (faint XL background + crisper foreground), soft halo behind the
// title, double frame and corner ornaments. Each category has its own accent
// hue so the deck feels varied without us hand-illustrating every card.

import type { OracleCard } from "@/data/deck";
import { CardSigil } from "@/components/CardSigil";

const ACCENTS: Record<string, string> = {
  Mind: "214 56% 72%",
  Emotion: "342 58% 76%",
  Action: "28 78% 66%",
  Relationships: "12 62% 74%",
  Direction: "224 60% 70%",
  Growth: "150 42% 62%",
  "Inner World": "262 46% 72%",
  Shadow: "236 30% 40%",
  Micro: "200 30% 70%",
  "Life Patterns": "188 48% 64%",
};

interface Props {
  card: OracleCard;
}

export const CardFront = ({ card }: Props) => {
  const accent = ACCENTS[card.category] ?? "214 56% 72%";

  return (
    <>
      {/* Layered atmospheric background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 18%, hsl(${accent} / 0.30) 0%, transparent 62%), radial-gradient(ellipse at 50% 110%, hsl(${accent} / 0.18) 0%, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-beam opacity-25" />

      {/* Background sigil — oversized, very faint */}
      <div
        className="absolute -inset-6 flex items-center justify-center pointer-events-none"
        style={{ color: `hsl(${accent})` }}
      >
        <CardSigil card={card} className="h-full w-full opacity-[0.18]" />
      </div>

      {/* Foreground sigil — crisper, behind the title */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ color: `hsl(${accent})` }}
      >
        <CardSigil card={card} className="h-[72%] w-[72%] opacity-70" />
      </div>

      {/* Soft halo behind the title */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, hsl(${accent} / 0.32) 0%, transparent 70%)`,
        }}
      />

      {/* Double frame */}
      <div className="absolute inset-3 rounded-[1.25rem] border border-foreground/10" />
      <div className="absolute inset-[14px] rounded-[1.15rem] border border-foreground/[0.04]" />

      {/* Corner ornaments + center dots */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ color: `hsl(${accent})` }}
        aria-hidden
      >
        <g
          stroke="currentColor"
          fill="none"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        >
          <path d="M 6 10 L 6 6 L 10 6" />
          <path d="M 90 6 L 94 6 L 94 10" />
          <path d="M 6 90 L 6 94 L 10 94" />
          <path d="M 90 94 L 94 94 L 94 90" />
        </g>
        <g fill="currentColor" opacity="0.5">
          <circle cx="50" cy="14" r="0.5" />
          <circle cx="50" cy="86" r="0.5" />
        </g>
      </svg>

      <div className="relative h-full flex flex-col items-center justify-between p-5 text-center">
        <span
          className="text-[10px] tracking-[0.3em] uppercase font-medium"
          style={{ color: `hsl(${accent} / 0.95)` }}
        >
          {card.category}
        </span>

        <div className="flex flex-col items-center gap-2.5">
          <div
            className="h-px w-8"
            style={{ background: `hsl(${accent} / 0.5)` }}
          />
          <h3 className="font-display text-2xl font-medium text-foreground drop-shadow-sm">
            {card.name}
          </h3>
          <p className="text-sm text-muted-foreground italic">
            {card.keyword}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: `hsl(${accent} / 0.7)` }}
          />
          <div className="h-px w-10 bg-foreground/10" />
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: `hsl(${accent} / 0.7)` }}
          />
        </div>
      </div>
    </>
  );
};
