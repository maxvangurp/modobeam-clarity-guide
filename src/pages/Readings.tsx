// Modobeam — Readings library
//
// A destination, not a list. Modes are grouped by the kind of reflection
// they invite: Quick · Deeper · Different lens · Context (Life Areas).
// Each mode renders as a category-tinted preview card with a depth chip
// and one of three states: ready, locked (with unlock-in count), or
// coming soon (premium placeholder for modes still in development).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReadingPreviewCard } from "@/components/ReadingPreviewCard";
import { READING_TYPES, type ReadingType } from "@/data/readingTypes";
import { COMING_SOON_MODES, type ComingSoonMode } from "@/data/comingSoonModes";
import {
  fetchRecentInsights,
  isReadingUnlocked,
  readingsRemainingToUnlock,
} from "@/lib/progression";
import { Compass } from "lucide-react";

interface SectionDef {
  key: "quick" | "deeper" | "context" | "coming";
  title: string;
  hint: string;
}

const SECTIONS: SectionDef[] = [
  {
    key: "quick",
    title: "Quick",
    hint: "Short, grounding moments — anytime",
  },
  {
    key: "deeper",
    title: "Deeper",
    hint: "When something is asking for more time",
  },
  {
    key: "context",
    title: "Context & layers",
    hint: "The wider map your reflections live inside",
  },
  {
    key: "coming",
    title: "Coming soon",
    hint: "New ways to reflect, on the way",
  },
];

// Where each existing reading type belongs in the library.
const READING_GROUP: Record<string, "quick" | "deeper"> = {
  daily: "quick",
  three: "quick",
  direction: "deeper",
  love: "deeper",
  "next-phase": "deeper",
  year: "deeper",
};

// The 3 coming-soon previews we surface as a dedicated section.
const COMING_SOON_FEATURED_IDS = [
  "ask-for-friend",
  "this-or-that",
  "whats-going-on",
] as const;

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

  // Bucket the real readings by group
  const readingsByGroup = (group: "quick" | "deeper"): ReadingType[] =>
    READING_TYPES.filter((r) => READING_GROUP[r.id] === group);

  // The dedicated "Coming soon" preview list — order matches the spec.
  const featuredComing: ComingSoonMode[] = COMING_SOON_FEATURED_IDS
    .map((id) => COMING_SOON_MODES.find((m) => m.id === id))
    .filter(Boolean) as ComingSoonMode[];

  return (
    <AppShell screenMood="reveal">
      {/* Header */}
      <section className="pt-2 pb-7 animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Ways to reflect
        </p>
        <h1 className="font-display text-[2rem] leading-[1.1] font-light tracking-tight text-foreground">
          Choose your <span className="font-medium italic">depth</span>.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Modobeam offers many ways in. Start with what's near. New shapes
          appear as you keep showing up.
        </p>
      </section>

      {/* Sections */}
      <div className="space-y-9">
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
                  className="group w-full text-left rounded-2xl bg-[linear-gradient(140deg,hsl(40_30%_97%)_0%,hsl(211_40%_92%)_60%,hsl(218_36%_85%)_100%)] border border-border/50 px-5 py-4 mt-3 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-smooth"
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

          if (section.key === "coming") {
            return (
              <section
                key={section.key}
                className="animate-fade-up"
                style={{ animationDelay: `${120 + sectionIdx * 80}ms` }}
              >
                <SectionHeader title={section.title} hint={section.hint} />
                <div className="mt-3 space-y-2.5">
                  {featuredComing.map((m) => (
                    <ReadingPreviewCard
                      key={m.id}
                      label={m.label}
                      subtitle={m.subtitle}
                      description={m.description}
                      cardCount={m.cardCount}
                      icon={m.icon}
                      category={m.category}
                      state="coming-soon"
                    />
                  ))}
                </div>
              </section>
            );
          }

          const real = readingsByGroup(section.key);
          if (real.length === 0) return null;

          return (
            <section
              key={section.key}
              className="animate-fade-up"
              style={{ animationDelay: `${120 + sectionIdx * 80}ms` }}
            >
              <SectionHeader title={section.title} hint={section.hint} />
              <div className="mt-3 space-y-2.5">
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
          Modobeam grows with you. New shapes will appear when you're ready.
        </p>
      )}
    </AppShell>
  );
};

const SectionHeader = ({ title, hint }: { title: string; hint: string }) => (
  <div className="flex items-baseline justify-between gap-3 px-1">
    <h2 className="font-display text-[15px] font-medium text-foreground">
      {title}
    </h2>
    <span className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground/70 text-right">
      {hint}
    </span>
  </div>
);

export default Readings;
