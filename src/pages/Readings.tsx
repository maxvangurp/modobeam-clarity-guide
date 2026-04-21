import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { READING_TYPES, type DrawType } from "@/data/readingTypes";
import {
  fetchRecentInsights,
  isReadingUnlocked,
  readingsRemainingToUnlock,
} from "@/lib/progression";
import { Lock } from "lucide-react";

const Readings = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const insights = await fetchRecentInsights(50);
      setTotal(insights.length);
    })();
  }, []);

  const start = (type: DrawType) => navigate(`/draw/${type}`);
  const t = total ?? 0;

  return (
    <AppShell showBack backTo="/">
      <section className="pt-2 pb-8 animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Readings
        </p>
        <h1 className="font-display text-[2rem] leading-[1.1] font-light tracking-tight text-foreground">
          Choose your <span className="font-medium italic">depth</span>.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Start simple. New shapes of reflection appear as you keep showing up.
        </p>
      </section>

      <div className="grid gap-2.5 animate-fade-up [animation-delay:120ms]">
        {READING_TYPES.map((r) => {
          const Icon = r.icon;
          const unlocked = isReadingUnlocked(r.id, t);
          const remaining = readingsRemainingToUnlock(r.id, t);

          if (!unlocked) {
            return (
              <div
                key={r.id}
                className="w-full text-left rounded-2xl bg-card/30 border border-border/30 px-5 py-4 opacity-70"
                aria-disabled
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                    <Lock
                      className="h-3.5 w-3.5 text-muted-foreground/60"
                      strokeWidth={1.6}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-[15px] font-medium text-foreground/70">
                        {r.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 shrink-0">
                        {remaining} more
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground/80 leading-relaxed mt-0.5">
                      Unlocks after {remaining} more reflection
                      {remaining === 1 ? "" : "s"}.
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={r.id}
              onClick={() => start(r.id)}
              className="group w-full text-left rounded-2xl bg-card/60 backdrop-blur border border-border/50 px-5 py-4 hover:bg-card/80 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-secondary/60 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[15px] font-medium text-foreground">
                      {r.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground/50 shrink-0">
                      {r.cardCount} {r.cardCount === 1 ? "card" : "cards"}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                    {r.description}
                  </p>
                </div>
                <span className="text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-smooth">
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {total !== null && total < 5 && (
        <p className="text-center text-[11px] text-muted-foreground/70 mt-6 italic">
          Modobeam grows with you. New shapes will appear when you're ready.
        </p>
      )}
    </AppShell>
  );
};

export default Readings;
