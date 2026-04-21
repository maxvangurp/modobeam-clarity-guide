import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { READING_TYPES, type DrawType } from "@/data/readingTypes";
import { getProfile, isOnboardingComplete } from "@/lib/profile";

const Index = () => {
  const navigate = useNavigate();
  const [intention, setIntention] = useState("");

  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate("/welcome", { replace: true });
    }
  }, [navigate]);

  const profile = getProfile();
  const greeting = profile?.firstName
    ? `Hello, ${profile.firstName}.`
    : "A quiet moment with yourself.";

  const start = (type: DrawType) => {
    const params = new URLSearchParams();
    if (intention.trim()) params.set("q", intention.trim());
    navigate(`/draw/${type}${params.toString() ? `?${params}` : ""}`);
  };

  const featured = READING_TYPES.filter((r) => r.featured);
  const more = READING_TYPES.filter((r) => !r.featured);

  return (
    <AppShell>
      <section className="pt-8 pb-10 animate-fade-up">
        <p className="text-sm text-muted-foreground mb-3 tracking-wide">
          A quiet moment with yourself.
        </p>
        <h1 className="font-display text-[2.4rem] leading-[1.05] font-light tracking-tight text-foreground">
          What do you need
          <br />
          <span className="font-medium italic">clarity</span> on?
        </h1>
      </section>

      <section className="space-y-3 animate-fade-up [animation-delay:120ms]">
        <label
          htmlFor="intention"
          className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Optional · what's on your mind
        </label>
        <Textarea
          id="intention"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="A decision, a feeling, a question..."
          rows={3}
          className="resize-none rounded-2xl bg-card/70 border-border/60 backdrop-blur text-base placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/30"
          maxLength={400}
        />
        <p className="text-[11px] text-muted-foreground/70 text-right">
          {intention.length}/400
        </p>
      </section>

      {/* Featured readings */}
      <section className="mt-6 grid gap-3 animate-fade-up [animation-delay:240ms]">
        {featured.map((r, i) => {
          const Icon = r.icon;
          const isPrimary = i === 0;
          return (
            <Button
              key={r.id}
              size="lg"
              variant={isPrimary ? "default" : "outline"}
              onClick={() => start(r.id)}
              className={`h-auto py-5 px-5 rounded-2xl justify-between group ${
                isPrimary
                  ? "bg-gradient-button text-primary-foreground hover:opacity-95 shadow-soft"
                  : "bg-card/70 backdrop-blur border-border/70 hover:bg-card"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    isPrimary ? "bg-white/10" : "bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-left">
                  <span className="block font-display text-base font-medium">
                    {r.label}
                  </span>
                  <span
                    className={`block text-xs font-body ${
                      isPrimary ? "opacity-70" : "text-muted-foreground"
                    }`}
                  >
                    {r.subtitle}
                  </span>
                </span>
              </span>
              <span
                className={`text-xl group-hover:translate-x-0.5 transition-smooth ${
                  isPrimary ? "opacity-60" : "text-muted-foreground"
                }`}
              >
                →
              </span>
            </Button>
          );
        })}
      </section>

      {/* Deeper readings */}
      <section className="mt-8 animate-fade-up [animation-delay:360ms]">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3 pl-1">
          Deeper readings
        </h2>
        <div className="grid gap-2.5">
          {more.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => start(r.id)}
                className="group w-full text-left rounded-2xl bg-card/60 backdrop-blur border border-border/50 px-5 py-4 hover:bg-card/80 transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-[15px] font-medium text-foreground">
                        {r.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50 shrink-0">
                        {r.cardCount} cards
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
      </section>

      <section className="mt-10 rounded-3xl bg-card/50 backdrop-blur border border-border/50 p-5 animate-fade-up [animation-delay:480ms]">
        <h2 className="font-display text-sm font-medium text-foreground mb-1.5">
          A note on how this works
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Modobeam doesn't predict the future. The cards are prompts —
          carefully written reflections to help you notice what you already
          know.
        </p>
      </section>
    </AppShell>
  );
};

export default Index;
