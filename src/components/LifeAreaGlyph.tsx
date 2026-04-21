// Modobeam — Life Area glyph
// Minimal, calm SVG symbols for the 25 Life Area cards. Each glyph is
// abstract, low-detail, and uses currentColor so it inherits the card's
// soft indigo/blue ink. Symbolic over literal: a horizon for direction,
// two soft shapes for relationships, a layered form for inner world.

import type { LifeAreaMotif } from "@/data/lifeAreas";

interface Props {
  motif: LifeAreaMotif;
  className?: string;
}

const SIZE = 200;
const C = SIZE / 2;

export const LifeAreaGlyph = ({ motif, className }: Props) => {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        stroke="currentColor"
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.78}
      >
        {renderMotif(motif)}
      </g>
    </svg>
  );
};

function renderMotif(motif: LifeAreaMotif) {
  switch (motif) {
    case "centered-circle":
      return (
        <g>
          <circle cx={C} cy={C} r={56} opacity={0.35} />
          <circle cx={C} cy={C} r={36} opacity={0.6} />
          <circle cx={C} cy={C} r={6} fill="currentColor" />
        </g>
      );

    case "rising-arc":
      return (
        <g>
          <path d={`M 40 140 Q ${C} 30 160 140`} />
          <line x1={40} y1={140} x2={160} y2={140} opacity={0.35} />
          <circle cx={C} cy={62} r={3.5} fill="currentColor" />
        </g>
      );

    case "upward-stem":
      return (
        <g>
          <line x1={C} y1={150} x2={C} y2={60} />
          <path d={`M ${C} 86 Q ${C - 22} 78 ${C - 30} 58`} opacity={0.7} />
          <path d={`M ${C} 102 Q ${C + 24} 92 ${C + 32} 70`} opacity={0.7} />
          <circle cx={C} cy={56} r={4} fill="currentColor" />
        </g>
      );

    case "horizon-path":
      return (
        <g>
          <line x1={28} y1={118} x2={172} y2={118} opacity={0.45} />
          <path d={`M 36 150 Q ${C} 96 164 150`} />
          <circle cx={C} cy={118} r={3} fill="currentColor" opacity={0.7} />
        </g>
      );

    case "north-star":
      return (
        <g>
          <circle cx={C} cy={C} r={70} opacity={0.18} />
          <line x1={C} y1={36} x2={C} y2={70} />
          <line x1={C} y1={130} x2={C} y2={164} />
          <line x1={36} y1={C} x2={70} y2={C} />
          <line x1={130} y1={C} x2={164} y2={C} />
          <circle cx={C} cy={C} r={5} fill="currentColor" />
        </g>
      );

    case "stacked-blocks":
      return (
        <g>
          <rect x={66} y={132} width={68} height={22} rx={2} />
          <rect x={74} y={104} width={52} height={22} rx={2} opacity={0.75} />
          <rect x={82} y={76} width={36} height={22} rx={2} opacity={0.55} />
        </g>
      );

    case "ascending-bars":
      return (
        <g>
          <line x1={32} y1={154} x2={168} y2={154} opacity={0.4} />
          <rect x={48} y={120} width={20} height={34} rx={2} opacity={0.55} />
          <rect x={78} y={94} width={20} height={60} rx={2} opacity={0.7} />
          <rect x={108} y={68} width={20} height={86} rx={2} opacity={0.85} />
          <rect x={138} y={42} width={20} height={112} rx={2} />
        </g>
      );

    case "stacked-coins":
      return (
        <g>
          <ellipse cx={C} cy={142} rx={42} ry={10} />
          <ellipse cx={C} cy={120} rx={42} ry={10} opacity={0.85} />
          <ellipse cx={C} cy={98} rx={42} ry={10} opacity={0.7} />
          <ellipse cx={C} cy={76} rx={42} ry={10} opacity={0.55} />
        </g>
      );

    case "anchored-base":
      return (
        <g>
          <line x1={C} y1={50} x2={C} y2={140} />
          <path d={`M 60 140 Q ${C} 168 140 140`} />
          <line x1={50} y1={144} x2={150} y2={144} opacity={0.4} />
          <circle cx={C} cy={48} r={5} fill="currentColor" />
        </g>
      );

    case "enclosed-form":
      return (
        <g>
          <path d={`M 56 150 L 56 92 L ${C} 50 L 144 92 L 144 150 Z`} />
          <line x1={92} y1={150} x2={92} y2={114} opacity={0.55} />
          <line x1={108} y1={150} x2={108} y2={114} opacity={0.55} />
          <line x1={92} y1={114} x2={108} y2={114} opacity={0.55} />
        </g>
      );

    case "sheltered-arc":
      return (
        <g>
          <path d={`M 40 140 Q ${C} 50 160 140`} />
          <circle cx={C} cy={120} r={14} opacity={0.7} />
          <line x1={40} y1={148} x2={160} y2={148} opacity={0.35} />
        </g>
      );

    case "two-shapes":
      return (
        <g>
          <circle cx={84} cy={C} r={36} />
          <circle cx={120} cy={C} r={36} opacity={0.7} />
        </g>
      );

    case "linked-rings":
      return (
        <g>
          <circle cx={82} cy={C} r={32} />
          <circle cx={122} cy={C} r={32} opacity={0.75} />
          <circle cx={102} cy={C} r={4} fill="currentColor" opacity={0.6} />
        </g>
      );

    case "container-frame":
      return (
        <g>
          <rect x={48} y={48} width={104} height={104} rx={10} />
          <circle cx={C} cy={C} r={20} opacity={0.7} />
        </g>
      );

    case "connecting-lines":
      return (
        <g>
          <circle cx={56} cy={70} r={6} fill="currentColor" />
          <circle cx={148} cy={84} r={6} fill="currentColor" opacity={0.85} />
          <circle cx={70} cy={140} r={6} fill="currentColor" opacity={0.7} />
          <circle cx={150} cy={146} r={6} fill="currentColor" opacity={0.55} />
          <line x1={56} y1={70} x2={148} y2={84} opacity={0.6} />
          <line x1={56} y1={70} x2={70} y2={140} opacity={0.4} />
          <line x1={148} y1={84} x2={150} y2={146} opacity={0.5} />
          <line x1={70} y1={140} x2={150} y2={146} opacity={0.45} />
        </g>
      );

    case "parallel-paths":
      return (
        <g>
          <path d={`M 40 56 Q 90 110 60 156`} />
          <path d={`M 80 56 Q 130 110 100 156`} opacity={0.85} />
          <path d={`M 120 56 Q 170 110 140 156`} opacity={0.65} />
        </g>
      );

    case "interlocking-hearts":
      return (
        <g>
          <path d={`M 60 110 Q 60 80 90 80 Q 110 80 100 105 Q 90 130 60 110 Z`} />
          <path
            d={`M 140 110 Q 140 80 110 80 Q 90 80 100 105 Q 110 130 140 110 Z`}
            opacity={0.75}
          />
        </g>
      );

    case "fading-shape":
      return (
        <g>
          <circle cx={70} cy={C} r={28} />
          <circle cx={104} cy={C} r={22} opacity={0.6} />
          <circle cx={134} cy={C} r={14} opacity={0.35} />
          <circle cx={156} cy={C} r={6} opacity={0.18} />
        </g>
      );

    case "shifting-shapes":
      return (
        <g>
          <rect x={50} y={70} width={50} height={50} rx={6} />
          <rect
            x={100}
            y={92}
            width={50}
            height={50}
            rx={6}
            transform={`rotate(15 125 117)`}
            opacity={0.7}
          />
        </g>
      );

    case "released-thread":
      return (
        <g>
          <circle cx={60} cy={70} r={5} fill="currentColor" />
          <path d={`M 60 70 Q 90 110 110 100 T 160 150`} />
          <circle cx={160} cy={150} r={3} fill="currentColor" opacity={0.5} />
        </g>
      );

    case "mending-line":
      return (
        <g>
          <line x1={36} y1={C} x2={84} y2={C} />
          <path d={`M 84 ${C - 10} Q 100 ${C} 116 ${C - 10}`} />
          <path d={`M 84 ${C + 10} Q 100 ${C} 116 ${C + 10}`} />
          <line x1={116} y1={C} x2={164} y2={C} />
        </g>
      );

    case "layered-shapes":
      return (
        <g>
          <ellipse cx={C} cy={C} rx={70} ry={20} opacity={0.3} />
          <ellipse cx={C} cy={C} rx={56} ry={28} opacity={0.45} />
          <ellipse cx={C} cy={C} rx={40} ry={36} opacity={0.65} />
          <circle cx={C} cy={C} r={6} fill="currentColor" />
        </g>
      );

    case "mirrored-form":
      return (
        <g>
          <line x1={C} y1={40} x2={C} y2={160} opacity={0.35} />
          <path d={`M ${C - 6} 70 Q 60 ${C} ${C - 6} 150`} />
          <path d={`M ${C + 6} 70 Q 140 ${C} ${C + 6} 150`} opacity={0.85} />
        </g>
      );

    case "symmetrical-balance":
      return (
        <g>
          <line x1={36} y1={C} x2={164} y2={C} />
          <circle cx={64} cy={C} r={18} opacity={0.7} />
          <circle cx={136} cy={C} r={18} opacity={0.7} />
          <line x1={C} y1={C - 30} x2={C} y2={C + 30} opacity={0.5} />
          <circle cx={C} cy={C - 36} r={4} fill="currentColor" />
        </g>
      );

    case "open-vessel":
    default:
      return (
        <g>
          <path d={`M 60 70 L 60 130 Q ${C} 160 140 130 L 140 70`} />
          <line x1={50} y1={70} x2={150} y2={70} opacity={0.5} />
        </g>
      );
  }
}
