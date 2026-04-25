import { useLocation } from "react-router-dom";

/**
 * Returns the correct "back" path for the current page.
 *
 * Callers that navigate _to_ a page should pass `state: { back: '/their-path' }`
 * via React Router's navigate() or <Link state={...}>. This hook reads that
 * signal and falls back to `defaultPath` when none is present.
 *
 * This gives every page context-aware back navigation without hard-coding
 * where each page can be reached from.
 */
export function useBackNavigation(defaultPath: string): string {
  const location = useLocation();
  const state = location.state as { back?: string } | null;
  return state?.back ?? defaultPath;
}
