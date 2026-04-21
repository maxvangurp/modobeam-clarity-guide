import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LifeAreaCard } from "@/components/LifeAreaCard";
import { LIFE_AREAS, type LifeAreaTheme } from "@/data/lifeAreas";
import { cn } from "@/lib/utils";
import { Shuffle, Search, X } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Browsing buckets — collapse the seven internal themes into five calmer
// groups, easier to scan without losing meaning.
type BrowseGroup =
  | "Self"
  | "Relationships"
  | "Work & Direction"
  | "Inner Life"
  | "Change & Growth";

const GROUPS: BrowseGroup[] = [
  "Self",
  "Relationships",
  "Work & Direction",
  "Inner Life",
  "Change & Growth",
];

const THEME_TO_GROUP: Record<LifeAreaTheme, BrowseGroup> = {
  Self: "Self",
  Direction: "Work & Direction",
  "Work & Resources": "Work & Direction",
  "Home & Safety": "Inner Life",
  Relationships: "Relationships",
  "Change & Healing": "Change & Growth",
  "Inner World": "Inner Life",
};

const LifeAreas = () => {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState<BrowseGroup | "All">("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIFE_AREAS.filter((c) => {
      if (activeGroup !== "All" && THEME_TO_GROUP[c.theme] !== activeGroup) {
        return false;
      }
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeGroup, query]);

  return (
    <AppShell showBack backTo="/readings">
      <section className="pt-2 pb-6 animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Life Areas
        </p>
        <h1 className="font-display text-[2rem] leading-[1.1] font-light tracking-tight text-foreground">
          The shape of <span className="font-medium italic">a life</span>.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Life Areas add context to your reflections by showing where something
          may be unfolding most clearly in your life.
        </p>

        {/* Optional manual draw — secondary, calm */}
        <button
          onClick={() => {
            haptic("select");
            const pick = LIFE_AREAS[Math.floor(Math.random() * LIFE_AREAS.length)];
            navigate(`/life-areas/${pick.id}`);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 backdrop-blur px-4 py-2 text-[12px] text-foreground/80 hover:bg-card/80 hover:text-foreground transition-smooth"
        >
          <Shuffle className="h-3.5 w-3.5" strokeWidth={1.6} />
          Add a life lens
        </button>
      </section>

      {/* Search — soft, optional */}
      <div className="relative animate-fade-up [animation-delay:60ms]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70"
          strokeWidth={1.6}
        />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-full bg-card/50 backdrop-blur border border-border/50 pl-9 pr-9 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:bg-card/80 focus:border-border transition-smooth"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-smooth"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* Group filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 mt-3 scrollbar-hide animate-fade-up [animation-delay:100ms]">
        {(["All", ...GROUPS] as const).map((g) => {
          const active = activeGroup === g;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-smooth",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card/50 text-muted-foreground border-border/60 hover:bg-card/80",
              )}
            >
              {g}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-[12px] text-muted-foreground/80 mt-10 italic">
          Nothing here yet. Try another name or category.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-up [animation-delay:140ms]">
          {visible.map((card) => (
            <LifeAreaCard
              key={card.id}
              card={card}
              size="compact"
              onClick={() => navigate(`/life-areas/${card.id}`)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground/70 mt-8 italic">
        These cards are a contextual layer — not a system to live by.
      </p>
    </AppShell>
  );
};

export default LifeAreas;
