import { useMemo } from "react";
import type { InsightLite } from "@/lib/progression";
import { getInsightMoment } from "@/lib/insightMoment";
import { MOMENT_TINTS } from "@/lib/momentTint";

interface Props {
  insights: InsightLite[];
  className?: string;
}

interface Dot {
  id: string;
  x: number;
  y: number;
  r: number;
  fill: string;
  draw_type: string;
  date: string;
}

/**
 * A long-arc "constellation" of dots — one per saved reflection — placed
 * on a deterministic but soft scatter. Dots are tinted by the moment that
 * was chosen for that reflection (or muted neutral when none).
 *
 * Read: not data viz. A felt portrait of presence over time.
 */
export const Constellation = ({ insights, className }: Props) => {
  const W = 600;
  const H = 220;

  const dots: Dot[] = useMemo(() => {
    if (!insights.length) return [];
    const sorted = [...insights].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return sorted.map((i, idx) => {
      // Deterministic pseudo-random scatter from id
      const seed = hashString(i.id);
      const xRand = ((seed % 1000) / 1000 - 0.5) * 36;
      const yRand = (((seed >> 10) % 1000) / 1000 - 0.5) * 70;
      const t = sorted.length === 1 ? 0.5 : idx / (sorted.length - 1);
      const x = 28 + t * (W - 56) + xRand;
      const y = H / 2 + Math.sin(t * Math.PI * 2.2) * 22 + yRand;
      const moment = getInsightMoment(i.id);
      const tint = moment ? MOMENT_TINTS[moment] : null;
      const fill = tint ? `hsl(${tint.hsl})` : "hsl(218 15% 55%)";
      return {
        id: i.id,
        x,
        y,
        r: moment ? 3.2 : 2.4,
        fill,
        draw_type: i.draw_type,
        date: i.created_at,
      };
    });
  }, [insights]);

  if (!dots.length) return null;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${insights.length} reflections, gently arranged`}
      >
        <defs>
          <radialGradient id="mb-dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Gentle baseline */}
        <line
          x1="14"
          y1={H / 2}
          x2={W - 14}
          y2={H / 2}
          stroke="hsl(var(--border))"
          strokeOpacity="0.35"
          strokeWidth="0.6"
          strokeDasharray="2 4"
        />
        {dots.map((d) => (
          <g key={d.id}>
            <circle cx={d.x} cy={d.y} r={d.r * 3} fill="url(#mb-dot-glow)" opacity={0.35} />
            <circle cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
          </g>
        ))}
      </svg>
    </div>
  );
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
