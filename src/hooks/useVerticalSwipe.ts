// Lightweight vertical swipe detection for the progressive reading flow.
// Up = next, down = previous. Threshold is intentionally generous so a
// scroll inside the page doesn't accidentally trip a step change.

import { useRef } from "react";

interface Options {
  onNext?: () => void;
  onPrev?: () => void;
  threshold?: number;
}

export function useVerticalSwipe({
  onNext,
  onPrev,
  threshold = 70,
}: Options) {
  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startY.current = t.clientY;
    startX.current = t.clientX;
    startTime.current = Date.now();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current == null || startX.current == null) return;
    const t = e.changedTouches[0];
    const dy = t.clientY - startY.current;
    const dx = t.clientX - startX.current;
    const dt = Date.now() - startTime.current;
    startY.current = null;
    startX.current = null;
    // Ignore if it was mostly horizontal, or very slow (a scroll-pause).
    if (Math.abs(dx) > Math.abs(dy)) return;
    if (dt > 800) return;
    if (Math.abs(dy) < threshold) return;
    if (dy < 0) onNext?.();
    else onPrev?.();
  };

  return { onTouchStart, onTouchEnd };
}
