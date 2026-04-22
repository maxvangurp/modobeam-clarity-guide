import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InsightLite } from "@/lib/progression";
import { getInsightMoment } from "@/lib/insightMoment";
import { MOMENT_TINTS } from "@/lib/momentTint";
import { getReadingType } from "@/data/readingTypes";

interface Props {
  insights: InsightLite[];
  className?: string;
}

/**
 * Horizontal "river" of moment-tinted dots, one per reflection, oldest →
 * newest, left to right. Tap a dot to jump to that reflection.
 *
 * Quiet. No labels. Readable as shape, not data.
 */
export const HistoryRiver = ({ insights, className }: Props) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const W = 720;
  const H = 90;

  const dots = useMemo(() => {
    if (!insights.length) return [];
    const sorted = [...insights].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return sorted.map((i, idx) => {
      const t = sorted.length === 1 ? 0.5 : idx / (sorted.length - 1);
      const x = 18 + t * (W - 36);
      // gentle vertical wander seeded by index
      const y = H / 2 + Math.sin(idx * 0.85) * 14;
      const moment = getInsightMoment(i.id);
      const tint = moment ? MOMENT_TINTS[moment] : null;
      return {
        id: i.id,
        x,
        y,
        fill: tint ? `hsl(${tint.hsl})` : "hsl(218 15% 55%)",
        ring: tint ? `hsl(${tint.ring})` : "hsl(218 15% 45%)",
        date: i.created_at,
        reading: getReadingType(i.draw_type)?.label ?? i.draw_type,
        cardName: i.cards[0]?.name,
      };
    });
  }, [insights]);

  if (dots.length < 2) return null;
  const active = hovered ? dots.find((d) => d.id === hovered) : null;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="A river of your reflections"
      >
        {/* Soft current line */}
        <path
          d={dots
            .map((d, i) => `${i === 0 ? "M" : "L"}${d.x.toFixed(1)} ${d.y.toFixed(1)}`)
            .join(" ")}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {dots.map((d) => (
          <g
            key={d.id}
            onMouseEnter={() => setHovered(d.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(`/insight/${d.id}`)}
            style={{ cursor: "pointer" }}
          >
            <circle cx={d.x} cy={d.y} r={6} fill={d.fill} fillOpacity={0.18} />
            <circle
              cx={d.x}
              cy={d.y}
              r={hovered === d.id ? 4 : 3}
              fill={d.fill}
              stroke={d.ring}
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />
          </g>
        ))}
      </svg>
      {active && (
        <p className="mt-2 text-center text-[11px] italic text-muted-foreground truncate px-2">
          {active.cardName ?? active.reading} ·{" "}
          {new Date(active.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
      {!active && (
        <p className="mt-2 px-2 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
          {dots.length} {dots.length === 1 ? "moment" : "moments"}
        </p>
      )}
    </div>
  );
};
