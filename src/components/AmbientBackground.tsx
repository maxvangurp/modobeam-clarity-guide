import { useEffect, useState } from "react";
import { getAmbientLayer } from "@/lib/ambient";
import type { MomentNeed } from "@/lib/profile";

interface Props {
  moment?: MomentNeed | null;
}

/**
 * Slow-drifting radial wash placed behind the app shell. Refreshes its
 * tint every 5 minutes so it follows the day, and re-blends instantly
 * when the user picks a moment.
 *
 * Imperceptible per-second; unmistakable across a session.
 */
export const AmbientBackground = ({ moment = null }: Props) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const layer = getAmbientLayer(moment ?? null);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        key={`a-${tick}-${moment ?? "none"}`}
        className="absolute -inset-[20%] animate-ambient-drift"
        style={{
          background: `radial-gradient(60% 50% at 30% 20%, hsl(${layer.hsl} / ${
            layer.intensity * 0.55
          }) 0%, transparent 60%), radial-gradient(50% 45% at 75% 70%, hsl(${
            layer.accent
          } / ${layer.intensity * 0.4}) 0%, transparent 65%)`,
          mixBlendMode: "soft-light",
        }}
      />
    </div>
  );
};
