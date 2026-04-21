// Modobeam — "Just be here"
// A 30-second breathing visual the user can choose instead of reflecting.
// This is the trust-building moment: the app stays useful on hard days.
// No streak penalty, no AI, no save. Just a held breath.

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Optional closing line — usually the daily quote */
  closingLine?: string;
}

const TOTAL_SECONDS = 30;
// 4s in, 6s out — a gentle 4:6 box-style breath, scaled.
const CYCLE_MS = 10_000;
const IN_MS = 4_000;

export const JustBeHere = ({ open, onClose, closingLine }: Props) => {
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [done, setDone] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setRemaining(TOTAL_SECONDS);
      setDone(false);
      setPhase("in");
      startedAt.current = null;
      return;
    }
    haptic("warm");
    startedAt.current = Date.now();
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - (startedAt.current ?? Date.now());
      const left = Math.max(0, TOTAL_SECONDS - Math.floor(elapsed / 1000));
      setRemaining(left);
      const inCycle = elapsed % CYCLE_MS;
      setPhase(inCycle < IN_MS ? "in" : "out");
      if (left <= 0) {
        setDone(true);
        haptic("warm");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  const inhale = phase === "in";

  return (
    <div
      role="dialog"
      aria-label="A quiet moment"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-fade-in"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
        {!done ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-10">
              Just being here is enough
            </p>
            <div className="relative h-56 w-56 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-beam-soft to-beam/70 transition-transform ease-in-out"
                style={{
                  transform: inhale ? "scale(1)" : "scale(0.62)",
                  transitionDuration: inhale ? `${IN_MS}ms` : `${CYCLE_MS - IN_MS}ms`,
                  filter: "blur(0.5px)",
                  opacity: 0.75,
                }}
              />
              <div
                className="absolute inset-6 rounded-full border border-foreground/10"
              />
              <p className="relative font-display text-[15px] text-foreground/85 italic">
                {inhale ? "breathe in" : "breathe out"}
              </p>
            </div>
            <p className="mt-10 text-[12px] text-muted-foreground tabular-nums">
              {remaining}s
            </p>
          </>
        ) : (
          <div className="text-center max-w-xs animate-fade-up">
            <div className="h-2 w-2 rounded-full bg-foreground/70 mx-auto mb-6 animate-gentle-breathe" />
            <p className="font-display text-[20px] leading-snug text-foreground/90 italic">
              {closingLine ?? "You came. That's the whole thing."}
            </p>
            <button
              onClick={onClose}
              className="mt-10 text-[12px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-smooth"
            >
              return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
