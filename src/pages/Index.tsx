import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Layers } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [intention, setIntention] = useState("");

  const start = (type: "daily" | "three") => {
    const params = new URLSearchParams();
    if (intention.trim()) params.set("q", intention.trim());
    navigate(`/draw/${type}${params.toString() ? `?${params}` : ""}`);
  };

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

      <section className="mt-6 grid gap-3 animate-fade-up [animation-delay:240ms]">
        <Button
          size="lg"
          onClick={() => start("daily")}
          className="h-auto py-5 px-5 rounded-2xl bg-gradient-button text-primary-foreground hover:opacity-95 shadow-soft justify-between group"
        >
          <span className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display text-base font-medium">
                Daily clarity
              </span>
              <span className="block text-xs opacity-70 font-body">
                One card · one focus
              </span>
            </span>
          </span>
          <span className="text-xl opacity-60 group-hover:translate-x-0.5 transition-smooth">
            →
          </span>
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => start("three")}
          className="h-auto py-5 px-5 rounded-2xl bg-card/70 backdrop-blur border-border/70 hover:bg-card justify-between group"
        >
          <span className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display text-base font-medium">
                3-card insight
              </span>
              <span className="block text-xs text-muted-foreground font-body">
                Past · present · direction
              </span>
            </span>
          </span>
          <span className="text-xl text-muted-foreground group-hover:translate-x-0.5 transition-smooth">
            →
          </span>
        </Button>
      </section>

      <section className="mt-12 rounded-3xl bg-card/50 backdrop-blur border border-border/50 p-5 animate-fade-up [animation-delay:360ms]">
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
