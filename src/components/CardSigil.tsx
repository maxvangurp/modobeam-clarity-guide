// Modobeam — Card sigil
// A small generative SVG glyph rendered behind the card front. Each card id
// deterministically produces its own sigil from a seeded hash, and the
// motif language is shaped by the card category. The result: every card has
// a recognizable "thing" without us hand-illustrating 80 of them.
//
// Categories map to motifs:
//  - Mind         → concentric arcs (clear thinking, layered focus)
//  - Emotion      → tide/wave lines (rising and resting feeling)
//  - Action       → directional rays (movement, momentum)
//  - Life Patterns→ orbital nodes (recurring orbit)
//
// Style stays restrained: thin strokes, low opacity, no fill battles with
// the card art. The sigil should *appear* unique without being decorative.

import type { OracleCard } from "@/data/deck";

interface Props {
  card: OracleCard;
  className?: string;
}

// Tiny string hash — stable, no deps.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export const CardSigil = ({ card, className }: Props) => {
  const seed = hash(card.id);
  const rnd = seededRng(seed);

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;

  let motif: JSX.Element;

  if (card.category === "Mind") {
    // 3–4 concentric arcs at slightly varied openings
    const count = 3 + Math.floor(rnd() * 2);
    const arcs = Array.from({ length: count }).map((_, i) => {
      const r = 28 + i * 18;
      const startAngle = -90 + (rnd() - 0.5) * 60;
      const sweep = 200 + rnd() * 100;
      const endAngle = startAngle + sweep;
      const sx = cx + r * Math.cos((startAngle * Math.PI) / 180);
      const sy = cy + r * Math.sin((startAngle * Math.PI) / 180);
      const ex = cx + r * Math.cos((endAngle * Math.PI) / 180);
      const ey = cy + r * Math.sin((endAngle * Math.PI) / 180);
      const large = sweep > 180 ? 1 : 0;
      return (
        <path
          key={i}
          d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`}
          fill="none"
          strokeLinecap="round"
        />
      );
    });
    motif = <g>{arcs}</g>;
  } else if (card.category === "Emotion") {
    // Stacked tide lines — sinusoidal flow
    const lines = 4 + Math.floor(rnd() * 2);
    const baseAmp = 6 + rnd() * 6;
    const phase = rnd() * Math.PI * 2;
    const elems = Array.from({ length: lines }).map((_, i) => {
      const y = 50 + i * 22;
      const amp = baseAmp + i * 1.2;
      const pts: string[] = [];
      const segs = 36;
      for (let s = 0; s <= segs; s++) {
        const x = (s / segs) * (size - 40) + 20;
        const yy = y + Math.sin((s / segs) * Math.PI * 2 + phase + i * 0.5) * amp;
        pts.push(`${s === 0 ? "M" : "L"} ${x.toFixed(1)} ${yy.toFixed(1)}`);
      }
      return (
        <path
          key={i}
          d={pts.join(" ")}
          fill="none"
          strokeLinecap="round"
          opacity={0.55 + i * 0.08}
        />
      );
    });
    motif = <g>{elems}</g>;
  } else if (card.category === "Action") {
    // Directional rays from a single off-center origin
    const ox = cx + (rnd() - 0.5) * 30;
    const oy = cy + (rnd() - 0.5) * 30;
    const rays = 6 + Math.floor(rnd() * 4);
    const baseAngle = rnd() * 360;
    const elems = Array.from({ length: rays }).map((_, i) => {
      const a = baseAngle + (i / rays) * 360 + (rnd() - 0.5) * 8;
      const len = 50 + rnd() * 38;
      const ex = ox + Math.cos((a * Math.PI) / 180) * len;
      const ey = oy + Math.sin((a * Math.PI) / 180) * len;
      return (
        <line
          key={i}
          x1={ox}
          y1={oy}
          x2={ex}
          y2={ey}
          strokeLinecap="round"
        />
      );
    });
    motif = (
      <g>
        <circle cx={ox} cy={oy} r={3.2} fill="currentColor" opacity={0.6} />
        {elems}
      </g>
    );
  } else if (card.category === "Relationships") {
    const lines = 3 + Math.floor(rnd() * 2);
    const elems: JSX.Element[] = [];
    for (let i = 0; i < lines; i++) {
      const y1 = 45 + i * 28 + (rnd() - 0.5) * 6;
      const y2 = 58 + i * 26 + (rnd() - 0.5) * 6;
      const c1x = 58 + rnd() * 24;
      const c2x = 118 + rnd() * 24;
      elems.push(
        <path
          key={i}
          d={`M 36 ${y1} C ${c1x} ${y1 - 18}, ${c2x} ${y2 + 18}, 164 ${y2}`}
          fill="none"
          strokeLinecap="round"
          opacity={0.56 + i * 0.08}
        />,
      );
    }
    motif = <g>{elems}</g>;
  } else if (card.category === "Direction") {
    // Ascending chevrons / upward paths — forward motion with forks
    const paths = 3 + Math.floor(rnd() * 2);
    const elems: JSX.Element[] = [];
    for (let i = 0; i < paths; i++) {
      const startX = 50 + i * 36 + (rnd() - 0.5) * 10;
      const height = 48 + rnd() * 28;
      const midY = 156 - height * 0.5;
      const fork = rnd() > 0.5;
      elems.push(
        <path
          key={i}
          d={
            fork
              ? `M ${startX} 156 L ${startX - 10} ${midY} L ${startX - 18} ${midY - 10} M ${startX - 10} ${midY} L ${startX + 2} ${midY - 10}`
              : `M ${startX} 156 L ${startX} ${156 - height} L ${startX - 8} ${156 - height + 10} M ${startX} ${156 - height} L ${startX + 8} ${156 - height + 10}`
          }
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.56 + i * 0.1}
        />,
      );
    }
    motif = <g>{elems}</g>;
  } else if (card.category === "Growth") {
    const stems = 4 + Math.floor(rnd() * 2);
    const elems = Array.from({ length: stems }).map((_, i) => {
      const x = 42 + i * 28 + (rnd() - 0.5) * 8;
      const height = 58 + rnd() * 34;
      const bend = (rnd() - 0.5) * 18;
      return (
        <path
          key={i}
          d={`M ${x} 154 C ${x + bend} 130, ${x + bend * 0.4} ${154 - height}, ${x + bend * 0.8} ${154 - height - 18}`}
          fill="none"
          strokeLinecap="round"
          opacity={0.54 + i * 0.08}
        />
      );
    });
    motif = <g>{elems}</g>;
  } else if (card.category === "Inner World") {
    const rings = 3 + Math.floor(rnd() * 2);
    const elems = Array.from({ length: rings }).map((_, i) => {
      const rx = 26 + i * 18 + rnd() * 6;
      const ry = 18 + i * 12 + rnd() * 6;
      return (
        <ellipse
          key={i}
          cx={cx + (rnd() - 0.5) * 8}
          cy={cy + (rnd() - 0.5) * 8}
          rx={rx}
          ry={ry}
          fill="none"
          opacity={0.52 + i * 0.1}
        />
      );
    });
    motif = <g>{elems}</g>;
  } else if (card.category === "Shadow") {
    // Shadow — a doubled, slightly-offset spiral motif: the visible self
    // and the shadow self, slowly drawing inward toward integration.
    const elems: JSX.Element[] = [];
    const turns = 3.2 + rnd() * 0.8;
    const segs = 110;
    const buildSpiral = (offset: { x: number; y: number }, opacity: number) => {
      const pts: string[] = [];
      for (let s = 0; s <= segs; s++) {
        const t = (s / segs) * turns * Math.PI * 2;
        const r = 6 + (s / segs) * 70;
        const px = cx + offset.x + Math.cos(t) * r;
        const py = cy + offset.y + Math.sin(t) * r;
        pts.push(`${s === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
      }
      return (
        <path
          key={`spiral-${opacity}`}
          d={pts.join(" ")}
          fill="none"
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    };
    elems.push(buildSpiral({ x: 0, y: 0 }, 0.55));
    elems.push(
      buildSpiral(
        { x: (rnd() - 0.5) * 14, y: (rnd() - 0.5) * 14 },
        0.32,
      ),
    );
    motif = <g>{elems}</g>;
  } else {
    // Life Patterns — orbital nodes
    const orbits = 2 + Math.floor(rnd() * 2);
    const elems: JSX.Element[] = [];
    for (let o = 0; o < orbits; o++) {
      const rx = 40 + o * 22 + rnd() * 6;
      const ry = rx * (0.55 + rnd() * 0.4);
      const rot = rnd() * 180;
      elems.push(
        <ellipse
          key={`e-${o}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          transform={`rotate(${rot} ${cx} ${cy})`}
          opacity={0.6}
        />,
      );
      const nodes = 2 + Math.floor(rnd() * 2);
      for (let n = 0; n < nodes; n++) {
        const t = (n / nodes + rnd() * 0.1) * Math.PI * 2;
        const px = cx + Math.cos(t) * rx;
        const py = cy + Math.sin(t) * ry;
        // Apply rotation manually
        const rad = (rot * Math.PI) / 180;
        const dx = px - cx;
        const dy = py - cy;
        const rxp = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
        const ryp = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
        elems.push(
          <circle
            key={`n-${o}-${n}`}
            cx={rxp}
            cy={ryp}
            r={2.4}
            fill="currentColor"
            opacity={0.75}
          />,
        );
      }
    }
    motif = <g>{elems}</g>;
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        stroke="currentColor"
        strokeWidth={0.9}
        fill="none"
        opacity={0.7}
      >
        {motif}
      </g>
    </svg>
  );
};
