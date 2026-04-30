// Modobeam — Readings library
//
// A destination, not a list. Modes are grouped by *mood* — what the
// user is reaching for: Quick · Deeper · Together · Horizon · Moments.
// Each mode renders as a category-tinted preview card with a depth chip.
//
// Locks remain only on the original readings that already had thresholds
// (direction, love, next-phase, year). All new modes are immediately
// available so the app feels rich and explorable from day one.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReadingPreviewCard } from "@/components/ReadingPreviewCard";
import {
  READING_TYPES,
  readingsByGroup,
  type ReadingGroup,
  type ReadingType,
} from "@/data/readingTypes";
import {
  fetchRecentInsights,
  isReadingUnlocked,
  readingsRemainingToUnlock,
} from "@/lib/progression";
import { Compass } from "lucide-react";
import { layout } from "@/lib/layout";

interface SectionDef {
  key: ReadingGroup | "context";
  title: string;
  hint: string;
}

const SECTIONS: SectionDef[] = [
  { key: "quick", title: "Quick", hint: "Short, grounding moments — anytime" },
  { key: "deeper", title: "Deeper", hint: "When something is asking for more time" },
  { key: "together", title: "Together", hint: "Readings about someone — or with someone in mind" },
  { key: "horizon", title: "Horizon", hint: "Future-facing reflection · 3 months → 5 years" },
  { key: "moments", title: "Moments", hint: "Ritual readings for thresholds in your life" },
  { key: "context", title: "Context & layers", hint: "The wider map your reflections live inside" },
];

const Readings = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const insights = await fetchRecentInsights(50);
      setTotal(insights.length);
    })();
  }, []);

  const t = total ?? 0;

  return (
    <AppShell screenMood="reveal">
      {/* Header */}
      <section className={layout.pageHeader}>
        <div className={layout.pageIntro}>
          <p className={layout.eyebrow}>Ways to reflect</p>
          <h1 className={layout.title}>
            Choose your <span className="font-medium italic">depth</span>.
          </h1>
          <p className={layout.body}>
            Modobeam offers many ways in — alone, about someone close,
            for the day, or for the years ahead. Pick the shape that fits
            this moment.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {SECTIONS.map((section, sectionIdx) => {
          if (section.key === "context") {
            return (
              <section
                key={section.key}
                className="animate-fade-up"
                style={{ animationDelay: `${120 + sectionIdx * 80}ms` }}
              >
                <SectionHeader title={section.title} hint={section.hint} />
                <button
                  onClick={() => navigate("/life-areas")}
                  className="group mt-3 w-full rounded-2xl border border-border/50 bg-[linear-gradient(140deg,hsl(40_30%_97%)_0%,hsl(211_40%_92%)_60%,hsl(218_36%_85%)_100%)] px-5 py-5 text-left shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-background/60 backdrop-blur flex items-center justify-center shrink-0">
                      <Compass
                        className="h-4 w-4 text-[hsl(218_45%_28%)]"
                        strokeWidth={1.6}
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-[15px] font-medium text-foreground">
                          Life Areas
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 shrink-0">
                          25 cards
                        </span>
                      </div>
                      <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-0.5">
                        A quiet map of life's domains. Browse, or let one
                        surface inside a reading.
                      </p>
                    </div>
                  </div>
                </button>
              </section>
            );
          }

          const real = readingsByGroup(section.key as ReadingGroup);
          if (real.length === 0) return null;

          return (
            <section
              key={section.key}
              className="animate-fade-up"
              style={{ animationDelay: `${120 + sectionIdx * 80}ms` }}
            >
              <SectionHeader title={section.title} hint={section.hint} />
              <div className="mt-3 space-y-3">
                {real.map((r) => {
                  const unlocked = isReadingUnlocked(r.id, t);
                  const remaining = readingsRemainingToUnlock(r.id, t);
                  return (
                    <ReadingPreviewCard
                      key={r.id}
                      to={unlocked ? `/draw/${r.id}` : undefined}
                      label={r.label}
                      subtitle={r.subtitle}
                      description={r.description}
                      cardCount={r.cardCount}
                      icon={r.icon}
                      category={r.category}
                      state={unlocked ? "ready" : "locked"}
                      unlockIn={remaining}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {total !== null && total < 5 && (
        <p className="text-center text-[11px] text-muted-foreground/70 mt-10 italic">
          Modobeam grows with you. Some shapes deepen as you keep showing up.
        </p>
      )}
    </AppShell>
  );
};

const SectionHeader = ({ title, hint }: { title: string; hint: string }) => (
  <div className={layout.splitHeader}>
    <h2 className="font-display text-[15px] font-medium text-foreground">
      {title}
    </h2>
    <span className="max-w-[12rem] text-right text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground/70">
      {hint}
    </span>
  </div>
);

export default Readings;
