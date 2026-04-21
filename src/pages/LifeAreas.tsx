import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LifeAreaCard } from "@/components/LifeAreaCard";
import {
  LIFE_AREAS,
  type LifeAreaTheme,
} from "@/data/lifeAreas";
import { cn } from "@/lib/utils";
import { Shuffle } from "lucide-react";
import { haptic } from "@/lib/haptics";

const THEMES: LifeAreaTheme[] = [
  "Self",
  "Direction",
  "Work & Resources",
  "Home & Safety",
  "Relationships",
  "Change & Healing",
  "Inner World",
];

const LifeAreas = () => {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<LifeAreaTheme | "All">("All");

  const visible = useMemo(() => {
    if (activeTheme === "All") return LIFE_AREAS;
    return LIFE_AREAS.filter((c) => c.theme === activeTheme);
  }, [activeTheme]);

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
          Twenty-five quiet domains that show up across a real life. Browse
          them, or let them surface naturally inside your readings.
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
          Draw one for context
        </button>
      </section>

      {/* Theme filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide animate-fade-up [animation-delay:80ms]">
        {(["All", ...THEMES] as const).map((t) => {
          const active = activeTheme === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTheme(t)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-smooth",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card/50 text-muted-foreground border-border/60 hover:bg-card/80",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

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

      <p className="text-center text-[11px] text-muted-foreground/70 mt-8 italic">
        These cards are a contextual layer — not a system to live by.
      </p>
    </AppShell>
  );
};

export default LifeAreas;
